"use server";

import { createClient } from "@/lib/supabase/server";
import { Review } from "@/types";

export interface SubmitReviewPayload {
  userId: string;
  username: string;
  displayName: string;
  showId: number;
  showName: string;
  showPoster?: string | null;
  seasonId?: number | null;
  seasonNumber?: number | null;
  rating?: number | null;
  content: string;
  hasSpoilers: boolean;
  spoilersUpToSeason?: number | null;
  spoilersUpToEpisode?: number | null;
}

export interface SubmitReviewResult {
  success: boolean;
  review?: Review;
  error?: string;
}

export async function submitReviewAction(
  payload: SubmitReviewPayload
): Promise<SubmitReviewResult> {
  // Basic validation
  if (!payload.content || payload.content.trim().length < 10) {
    return { success: false, error: "Review must be at least 10 characters." };
  }
  if (payload.content.trim().length > 3000) {
    return { success: false, error: "Review must be no longer than 3,000 characters." };
  }
  if (payload.rating !== null && payload.rating !== undefined) {
    if (payload.rating < 0.5 || payload.rating > 5.0) {
      return { success: false, error: "Rating must be between 0.5 and 5.0." };
    }
    // Round to nearest 0.5
    const rounded = Math.round(payload.rating * 2) / 2;
    payload.rating = rounded;
  }

  const supabase = await createClient();

  if (!supabase) {
    // Offline / no Supabase credentials — return a mock Review so UI still works
    const mockReview: Review = {
      id: `local-${Date.now()}`,
      user_id: payload.userId,
      user_profile: {
        id: payload.userId,
        username: payload.username,
        display_name: payload.displayName,
        avatar_url: null,
        created_at: new Date().toISOString(),
      },
      show_id: payload.showId,
      show_name: payload.showName,
      show_poster: payload.showPoster ?? null,
      season_id: payload.seasonId ?? null,
      season_number: payload.seasonNumber ?? null,
      rating: payload.rating ?? null,
      content: payload.content.trim(),
      has_spoilers: payload.hasSpoilers,
      spoilers_up_to_season: payload.spoilersUpToSeason ?? null,
      spoilers_up_to_episode: payload.spoilersUpToEpisode ?? null,
      likes_count: 0,
      is_liked_by_me: false,
      created_at: new Date().toISOString(),
    };
    return { success: true, review: mockReview };
  }

  // --- Supabase path ---
  // Helper: detect "table not found / schema not yet applied" errors so we can
  // fall back to offline mode instead of surfacing a raw DB error.
  function isSchemaError(msg: string): boolean {
    return (
      msg.includes("schema cache") ||
      msg.includes("relation") ||
      msg.includes("does not exist") ||
      msg.includes("42P01") ||
      msg.includes("PGRST116") ||
      msg.includes("Could not find the table")
    );
  }

  const offlineMock = (): SubmitReviewResult => ({
    success: true,
    review: {
      id: `local-${Date.now()}`,
      user_id: payload.userId,
      user_profile: {
        id: payload.userId,
        username: payload.username,
        display_name: payload.displayName,
        avatar_url: null,
        created_at: new Date().toISOString(),
      },
      show_id: payload.showId,
      show_name: payload.showName,
      show_poster: payload.showPoster ?? null,
      season_id: payload.seasonId ?? null,
      season_number: payload.seasonNumber ?? null,
      rating: payload.rating ?? null,
      content: payload.content.trim(),
      has_spoilers: payload.hasSpoilers,
      spoilers_up_to_season: payload.spoilersUpToSeason ?? null,
      spoilers_up_to_episode: payload.spoilersUpToEpisode ?? null,
      likes_count: 0,
      is_liked_by_me: false,
      created_at: new Date().toISOString(),
    },
  });

  // 1. Upsert the show into the shows cache table so FK is satisfied
  const { error: showUpsertError } = await supabase.from("shows").upsert(
    {
      id: payload.showId,
      name: payload.showName,
      poster_path: payload.showPoster ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id", ignoreDuplicates: false }
  );

  // If shows table also missing, schema hasn't been applied — use offline fallback
  if (showUpsertError && isSchemaError(showUpsertError.message)) {
    console.warn("[submitReviewAction] Schema not yet applied — using offline mock.");
    return offlineMock();
  }

  // 2. Insert the review
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: payload.userId,
      show_id: payload.showId,
      season_id: payload.seasonId ?? null,
      rating: payload.rating ?? null,
      content: payload.content.trim(),
      has_spoilers: payload.hasSpoilers,
      spoilers_up_to_season: payload.spoilersUpToSeason ?? null,
      spoilers_up_to_episode: payload.spoilersUpToEpisode ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    // Schema not yet migrated — fall back to offline mock gracefully
    if (error && isSchemaError(error.message)) {
      console.warn("[submitReviewAction] reviews table missing — using offline mock.");
      return offlineMock();
    }
    console.error("[submitReviewAction] Supabase error:", error);
    return { success: false, error: error?.message ?? "Failed to save review." };
  }

  const review: Review = {
    id: data.id,
    user_id: data.user_id,
    user_profile: {
      id: payload.userId,
      username: payload.username,
      display_name: payload.displayName,
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
    show_id: data.show_id,
    show_name: payload.showName,
    show_poster: payload.showPoster ?? null,
    season_id: data.season_id,
    season_number: payload.seasonNumber ?? null,
    rating: data.rating,
    content: data.content,
    has_spoilers: data.has_spoilers,
    spoilers_up_to_season: data.spoilers_up_to_season,
    spoilers_up_to_episode: data.spoilers_up_to_episode,
    likes_count: 0,
    is_liked_by_me: false,
    created_at: data.created_at,
  };

  return { success: true, review };
}
