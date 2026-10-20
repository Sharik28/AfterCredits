"use client";

import { useState, useRef, useEffect } from "react";
import { Bookmark, Check, Play, Clock, X, ChevronDown } from "lucide-react";
import { TVShow, WatchStatus } from "@/types";
import { formatStatusLabel, cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/store/watchlistStore";

interface WatchlistButtonProps {
  show: TVShow;
  className?: string;
}

export function WatchlistButton({ show, className }: WatchlistButtonProps) {
  const { getShowStatus, updateStatus } = useWatchlist();
  const currentStatus = getShowStatus(show.id);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statuses: { status: WatchStatus; label: string; icon: typeof Bookmark; desc: string }[] = [
    {
      status: "want_to_watch",
      label: "Want to Watch",
      icon: Bookmark,
      desc: "Save to your queue for upcoming binge sessions",
    },
    {
      status: "watching",
      label: "Watching",
      icon: Play,
      desc: "Currently viewing episodes of this series",
    },
    {
      status: "completed",
      label: "Completed",
      icon: Check,
      desc: "Finished all released seasons of this show",
    },
    {
      status: "on_hold",
      label: "On Hold",
      icon: Clock,
      desc: "Taking a temporary break, intend to return",
    },
    {
      status: "dropped",
      label: "Dropped",
      icon: X,
      desc: "Stopped watching without plans to finish",
    },
  ];

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg active:scale-95",
          currentStatus
            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 border border-rose-400/40"
            : "bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/30 backdrop-blur-md"
        )}
      >
        {currentStatus ? (
          <>
            <Check className="w-4 h-4 text-white" />
            <span>{formatStatusLabel(currentStatus)}</span>
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4 text-rose-400" />
            <span>Add to Watchlist</span>
          </>
        )}
        <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#12141c] border border-white/15 shadow-2xl z-50 p-2 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-white/5 flex items-center justify-between">
            <span>Viewing Status</span>
            {currentStatus && (
              <span className="text-rose-400 font-mono text-[10px]">Saved</span>
            )}
          </div>

          {statuses.map((item) => {
            const Icon = item.icon;
            const isSelected = currentStatus === item.status;
            return (
              <button
                key={item.status}
                onClick={() => {
                  updateStatus(show, item.status);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors",
                  isSelected
                    ? "bg-rose-600/20 border border-rose-500/40 text-white"
                    : "hover:bg-white/5 text-neutral-300 hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg mt-0.5",
                    isSelected ? "bg-rose-600 text-white" : "bg-neutral-800 text-neutral-400"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>{item.label}</span>
                    {isSelected && <span className="text-[10px] text-rose-400 font-bold">Active</span>}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight mt-0.5 line-clamp-1">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}

          {currentStatus && (
            <div className="pt-1 border-t border-white/5">
              <button
                onClick={() => {
                  updateStatus(show, null);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove from Watchlist</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
