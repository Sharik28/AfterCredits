"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  Play,
  Check,
  Clock,
  X,
  Compass,
  Star,
  Trash2,
  SlidersHorizontal,
  Cloud,
  HardDrive,
  AlertCircle,
  LogIn,
  Tv,
} from "lucide-react";
import { WatchStatus, WatchlistItem, TVShow } from "@/types";
import { useWatchlist } from "@/lib/store/watchlistStore";
import { useAuth } from "@/lib/auth/AuthContext";
import { getTMDBImageUrl, formatAirYear, formatRating, formatStatusLabel, cn } from "@/lib/utils";

function WatchlistPosterThumbnail({ show }: { show: TVShow }) {
  const [error, setError] = useState(false);
  const poster = getTMDBImageUrl(show.poster_path, "w342");

  if (error || !show.poster_path) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black flex flex-col items-center justify-center p-1.5 text-center">
        <Tv className="w-5 h-5 text-rose-500 mb-1" />
        <span className="text-[9px] font-bold text-neutral-300 line-clamp-2 leading-tight">{show.name}</span>
      </div>
    );
  }

  return (
    <Image
      src={poster}
      alt={show.name}
      fill
      sizes="80px"
      onError={() => setError(true)}
      className="object-cover group-hover:scale-105 transition-transform"
    />
  );
}

type FilterTab = "all" | WatchStatus;

export default function WatchlistPage() {
  const { items, isLoading, lastError, updateStatus } = useWatchlist();
  const { user, openAuthModal, isSupabaseAvailable, isDemoUser } = useAuth();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const tabCounts = {
    all: items.length,
    watching: items.filter((i) => i.status === "watching").length,
    want_to_watch: items.filter((i) => i.status === "want_to_watch").length,
    completed: items.filter((i) => i.status === "completed").length,
    on_hold: items.filter((i) => i.status === "on_hold").length,
    dropped: items.filter((i) => i.status === "dropped").length,
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  const tabs: { key: FilterTab; label: string; icon: typeof Bookmark; count: number }[] = [
    { key: "all", label: "All Shows", icon: SlidersHorizontal, count: tabCounts.all },
    { key: "watching", label: "Watching", icon: Play, count: tabCounts.watching },
    { key: "want_to_watch", label: "Want to Watch", icon: Bookmark, count: tabCounts.want_to_watch },
    { key: "completed", label: "Completed", icon: Check, count: tabCounts.completed },
    { key: "on_hold", label: "On Hold", icon: Clock, count: tabCounts.on_hold },
    { key: "dropped", label: "Dropped", icon: X, count: tabCounts.dropped },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-3.5 h-3.5 fill-rose-500" />
            <span>Personal Queue</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            My TV Watchlist
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Track what you&apos;re currently bingeing, what&apos;s up next, and what you&apos;ve completed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Storage status badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-neutral-400 font-mono">
            {user && isSupabaseAvailable && !isDemoUser ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Cloud Synced</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Local Storage</span>
              </>
            )}
          </div>

          <Link
            href="/discover"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            <span>Add More Shows</span>
          </Link>
        </div>
      </div>

      {/* Unauthenticated Sync Banner */}
      {!user && (
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-neutral-300">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400 shrink-0">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Offline Guest Session</span>
              <span className="text-neutral-400">
                Your queue is securely saved in this browser. Sign in or create an account to sync across devices.
              </span>
            </div>
          </div>
          <button
            onClick={() => openAuthModal("signin")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Sync</span>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {lastError && (
        <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{lastError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-3 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                isActive
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-950/40"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  isActive ? "bg-white/20 text-white" : "bg-neutral-800 text-neutral-400"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content List / Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-neutral-400 animate-pulse">
          Loading your watchlist...
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const show = item.show;
            if (!show) return null;

            const poster = getTMDBImageUrl(show.poster_path, "w342");
            const year = formatAirYear(show.first_air_date);
            const rating = formatRating(show.vote_average);

            return (
              <div
                key={item.id}
                className="group flex gap-4 p-4 rounded-2xl bg-[#12141c]/90 border border-white/10 hover:border-white/20 transition-all duration-200 relative"
              >
                {/* Poster Thumbnail */}
                <Link
                  href={`/show/${show.id}`}
                  className="relative w-20 aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0"
                >
                  <WatchlistPosterThumbnail show={show} />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/show/${show.id}`}
                        className="text-sm font-bold text-white hover:text-rose-400 transition-colors line-clamp-1"
                      >
                        {show.name}
                      </Link>
                      <button
                        onClick={() => updateStatus(show, null)}
                        className="text-neutral-500 hover:text-red-400 p-1 -mt-1 -mr-1 transition-colors"
                        title="Remove from watchlist"
                        aria-label={`Remove ${show.name} from watchlist`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span>{year}</span>
                      <span>•</span>
                      <span>
                        {show.number_of_seasons} {show.number_of_seasons === 1 ? "Season" : "Seasons"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-300 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{rating}</span>
                    </div>
                  </div>

                  {/* Status selector select */}
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Status:
                    </span>
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(show, e.target.value as WatchStatus)}
                      aria-label={`Change status for ${show.name}`}
                      className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-rose-300 font-medium focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      <option value="want_to_watch">Want to Watch</option>
                      <option value="watching">Watching</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 rounded-3xl bg-[#12141c]/50 border border-white/5 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-500">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Your watchlist is empty</h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              {activeTab === "all"
                ? "Start adding shows you want to watch or are currently bingeing."
                : `You don't have any shows marked as "${formatStatusLabel(activeTab)}".`}
            </p>
          </div>
          <Link
            href="/discover"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Shows to Add</span>
          </Link>
        </div>
      )}
    </div>
  );
}
