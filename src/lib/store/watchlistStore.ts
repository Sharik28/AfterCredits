"use client";

import { useEffect, useState, useCallback } from "react";
import { WatchStatus, WatchlistItem, TVShow } from "@/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const STORAGE_KEY = "aftercredits_watchlist_v1";

// In-memory subscriber registry for reactive cross-component state sync
type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

// Local storage helper
function getStoredWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read watchlist from localStorage", e);
    return [];
  }
}

function saveStoredWatchlist(items: WatchlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    emitChange();
  } catch (e) {
    console.error("Failed to write watchlist to localStorage", e);
  }
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Check if Supabase is active and has an authenticated session
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("watchlist_items")
            .select("*, show:shows(*)")
            .eq("user_id", user.id);

          if (!error && data) {
            setItems(data as WatchlistItem[]);
            setIsLoading(false);
            return;
          }
        }
      }
    }

    // Fallback to persisted localStorage
    const local = getStoredWatchlist();
    setItems(local);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const handleChange = () => {
      refresh();
    };
    listeners.add(handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      listeners.delete(handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [refresh]);

  const updateStatus = useCallback(
    async (show: TVShow, status: WatchStatus | null) => {
      const currentItems = getStoredWatchlist();
      let updated: WatchlistItem[];

      if (status === null) {
        // Remove from watchlist
        updated = currentItems.filter((i) => i.show_id !== show.id);
      } else {
        const existingIndex = currentItems.findIndex((i) => i.show_id === show.id);
        const now = new Date().toISOString();

        if (existingIndex >= 0) {
          updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status,
            show,
            updated_at: now,
          };
        } else {
          const newItem: WatchlistItem = {
            id: `wl_${Date.now()}_${show.id}`,
            user_id: "local_user",
            show_id: show.id,
            show,
            status,
            current_season: 1,
            current_episode: 0,
            created_at: now,
            updated_at: now,
          };
          updated = [newItem, ...currentItems];
        }
      }

      saveStoredWatchlist(updated);
      setItems(updated);

      // Async sync to Supabase if configured & user logged in
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          if (supabase) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              if (status === null) {
                await supabase
                  .from("watchlist_items")
                  .delete()
                  .eq("user_id", user.id)
                  .eq("show_id", show.id);
              } else {
                // Ensure show exists in Supabase cache
                await supabase.from("shows").upsert({
                  id: show.id,
                  name: show.name,
                  overview: show.overview,
                  poster_path: show.poster_path,
                  backdrop_path: show.backdrop_path,
                  first_air_date: show.first_air_date,
                  vote_average: show.vote_average,
                  number_of_seasons: show.number_of_seasons,
                  number_of_episodes: show.number_of_episodes,
                  updated_at: new Date().toISOString(),
                });

                await supabase.from("watchlist_items").upsert({
                  user_id: user.id,
                  show_id: show.id,
                  status,
                  updated_at: new Date().toISOString(),
                });
              }
            }
          }
        } catch (err) {
          console.warn("Supabase watchlist sync deferred:", err);
        }
      }
    },
    []
  );

  const getShowStatus = useCallback(
    (showId: number): WatchStatus | null => {
      const match = items.find((i) => i.show_id === showId);
      return match ? match.status : null;
    },
    [items]
  );

  return {
    items,
    isLoading,
    updateStatus,
    getShowStatus,
    refresh,
  };
}
