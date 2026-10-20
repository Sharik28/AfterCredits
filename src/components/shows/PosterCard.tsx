"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Bookmark, Check, Play, Clock, X } from "lucide-react";
import { TVShow, WatchStatus } from "@/types";
import { getTMDBImageUrl, formatAirYear, formatRating, formatStatusLabel, cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/store/watchlistStore";
import { useState } from "react";

interface PosterCardProps {
  show: TVShow;
  priority?: boolean;
}

export function PosterCard({ show, priority = false }: PosterCardProps) {
  const { getShowStatus, updateStatus } = useWatchlist();
  const currentStatus = getShowStatus(show.id);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const posterUrl = getTMDBImageUrl(show.poster_path, "w500");
  const year = formatAirYear(show.first_air_date);
  const rating = formatRating(show.vote_average);

  const statusOptions: { status: WatchStatus | null; label: string; icon: typeof Bookmark }[] = [
    { status: "want_to_watch", label: "Want to Watch", icon: Bookmark },
    { status: "watching", label: "Watching", icon: Play },
    { status: "completed", label: "Completed", icon: Check },
    { status: "on_hold", label: "On Hold", icon: Clock },
    { status: null, label: "Remove", icon: X },
  ];

  return (
    <div className="group relative flex flex-col">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 poster-card">
        <Link href={`/show/${show.id}`} className="block w-full h-full">
          {show.poster_path ? (
            <Image
              src={posterUrl}
              alt={show.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-neutral-800 to-neutral-950">
              <span className="text-2xl font-black text-neutral-600 mb-2">AC</span>
              <span className="text-xs font-semibold text-neutral-300 line-clamp-3">{show.name}</span>
            </div>
          )}

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity" />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Rating */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-amber-300 shadow-lg">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>

          {/* Active Watchlist Status Pill */}
          {currentStatus && (
            <div className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg border border-rose-400/30">
              {formatStatusLabel(currentStatus)}
            </div>
          )}
        </div>

        {/* Quick Action Watchlist Button */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowStatusMenu(!showStatusMenu);
            }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xl",
              currentStatus
                ? "bg-rose-600 text-white border border-rose-400"
                : "bg-black/70 text-neutral-300 border border-white/20 hover:bg-rose-600 hover:text-white"
            )}
            title="Update Watchlist Status"
            aria-label="Update Watchlist Status"
          >
            {currentStatus ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Status Dropdown Popover */}
          {showStatusMenu && (
            <div
              className="absolute bottom-10 right-0 w-44 rounded-xl bg-neutral-900 border border-white/15 p-1 shadow-2xl z-30 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-white/5">
                Set Watch Status
              </div>
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = currentStatus === opt.status;
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      updateStatus(show, opt.status);
                      setShowStatusMenu(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors",
                      isSelected
                        ? "bg-rose-600 text-white font-medium"
                        : "text-neutral-300 hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Show Details under card */}
      <div className="mt-2.5 flex flex-col">
        <Link
          href={`/show/${show.id}`}
          className="text-sm font-semibold text-neutral-200 hover:text-rose-400 transition-colors line-clamp-1 leading-snug"
        >
          {show.name}
        </Link>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
          <span>{year}</span>
          <span>•</span>
          <span>
            {show.number_of_seasons} {show.number_of_seasons === 1 ? "Season" : "Seasons"}
          </span>
        </div>
      </div>
    </div>
  );
}
