"use server";

import { createClient } from "@/lib/supabase/server";
import { TVShow, WatchStatus, WatchlistItem } from "@/types";

const VALID_STATUSES: WatchStatus[] = [
  "want_to_watch",
  "watching",
  "completed",
  "on_hold",
  "dropped",
];

export interface WatchlistActionResponse {
  success: boolean;
  error?: string;
  item?: WatchlistItem;
}

/**
 * Server action to update or remove an item from user's watchlist
 */
export async function updateWatchlistAction(
  show: TVShow,
  status: WatchStatus | null,
  currentSeason: number = 1,
  currentEpisode: number = 0
): Promise<WatchlistActionResponse> {
  // 1. Validation
  if (!show || typeof show.id !== "number" || show.id <= 0) {
    return { success: false, error: "Invalid show metadata." };
  }

  if (status !== null && !VALID_STATUSES.includes(status)) {
    return { success: false, error: "Invalid watch status specified." };
  }

  if (currentSeason < 1 || currentEpisode < 0) {
    return { success: false, error: "Invalid season or episode progress counter." };
  }

  // 2. Supabase Cloud Sync
  const supabase = await createClient();
  if (!supabase) {
    // Graceful offline return — client store saves to localStorage
    return {
      success: true,
      error: "OFFLINE_MODE",
    };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "UNAUTHENTICATED",
      };
    }

    if (status === null) {
      // Remove from watchlist
      const { error: deleteError } = await supabase
        .from("watchlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("show_id", show.id);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } else {
      // Ensure show is cached in the public catalog table
      await supabase.from("shows").upsert({
        id: show.id,
        name: show.name,
        original_name: show.original_name || null,
        overview: show.overview || "",
        poster_path: show.poster_path || null,
        backdrop_path: show.backdrop_path || null,
        first_air_date: show.first_air_date || null,
        status: show.status || "Unknown",
        number_of_seasons: show.number_of_seasons || 1,
        number_of_episodes: show.number_of_episodes || 0,
        vote_average: show.vote_average || 0,
        genres: show.genres || [],
        updated_at: new Date().toISOString(),
      });

      // Upsert into user's watchlist (RLS verifies auth.uid() = user_id)
      const now = new Date().toISOString();
      const { data, error: upsertError } = await supabase
        .from("watchlist_items")
        .upsert({
          user_id: user.id,
          show_id: show.id,
          status,
          current_season: currentSeason,
          current_episode: currentEpisode,
          updated_at: now,
        })
        .select("*, show:shows(*)")
        .single();

      if (upsertError) {
        return { success: false, error: upsertError.message };
      }

      return {
        success: true,
        item: data as WatchlistItem,
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update watchlist in cloud.";
    return { success: false, error: msg };
  }
}

/**
 * Server action to fetch all watchlist items for the current authenticated user
 */
export async function getWatchlistAction(): Promise<{
  success: boolean;
  items: WatchlistItem[];
  error?: string;
}> {
  const supabase = await createClient();
  if (!supabase) {
    return { success: true, items: [] };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: true, items: [] };
    }

    const { data, error } = await supabase
      .from("watchlist_items")
      .select("*, show:shows(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return { success: false, items: [], error: error.message };
    }

    return {
      success: true,
      items: (data || []) as WatchlistItem[],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to retrieve watchlist.";
    return { success: false, items: [], error: msg };
  }
}
