"use client";

import { useEffect, useState, useCallback } from "react";
import { WatchStatus, WatchlistItem, TVShow } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { updateWatchlistAction, getWatchlistAction } from "@/lib/watchlist/actions";

const STORAGE_KEY = "aftercredits_watchlist_v1";

// In-memory subscriber registry for reactive cross-component state sync
type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Watchlist listener error", e);
    }
  });
}

// Local storage helpers
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // 1. Initial immediate load from localStorage for fast zero-latency rendering
    const local = getStoredWatchlist();
    if (local.length > 0) {
      setItems(local);
    }

    // 2. If Supabase is configured, fetch latest from server action
    if (isSupabaseConfigured()) {
      try {
        const res = await getWatchlistAction();
        if (res.success && res.items.length > 0) {
          // Merge / replace with cloud source of truth
          setItems(res.items);
          saveStoredWatchlist(res.items);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Supabase watchlist sync deferred:", err);
      }
    }

    setItems(local);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const handleChange = () => {
      const current = getStoredWatchlist();
      setItems(current);
    };

    listeners.add(handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      listeners.delete(handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [refresh]);

  const updateStatus = useCallback(
    async (
      show: TVShow,
      status: WatchStatus | null,
      currentSeason: number = 1,
      currentEpisode: number = 0
    ) => {
      setIsUpdating(true);
      setLastError(null);

      const currentItems = getStoredWatchlist();
      let updated: WatchlistItem[];
      const now = new Date().toISOString();

      // 1. Optimistic local update
      if (status === null) {
        // Remove from watchlist
        updated = currentItems.filter((i) => i.show_id !== show.id);
      } else {
        const existingIndex = currentItems.findIndex((i) => i.show_id === show.id);

        if (existingIndex >= 0) {
          updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status,
            show,
            current_season: currentSeason,
            current_episode: currentEpisode,
            updated_at: now,
          };
        } else {
          const newItem: WatchlistItem = {
            id: `wl_${Date.now()}_${show.id}`,
            user_id: "local_user",
            show_id: show.id,
            show,
            status,
            current_season: currentSeason,
            current_episode: currentEpisode,
            created_at: now,
            updated_at: now,
          };
          updated = [newItem, ...currentItems];
        }
      }

      // Save locally and notify all components immediately
      saveStoredWatchlist(updated);
      setItems(updated);

      // 2. Perform server validation and Supabase cloud persistence
      try {
        const res = await updateWatchlistAction(
          show,
          status,
          currentSeason,
          currentEpisode
        );

        if (!res.success && res.error && res.error !== "OFFLINE_MODE" && res.error !== "UNAUTHENTICATED") {
          console.warn("Watchlist cloud update note:", res.error);
          setLastError(res.error);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to sync status";
        console.warn("Watchlist server action deferred:", msg);
      } finally {
        setIsUpdating(false);
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

  const getWatchlistItem = useCallback(
    (showId: number): WatchlistItem | undefined => {
      return items.find((i) => i.show_id === showId);
    },
    [items]
  );

  return {
    items,
    isLoading,
    isUpdating,
    lastError,
    updateStatus,
    getShowStatus,
    getWatchlistItem,
    refresh,
  };
}
