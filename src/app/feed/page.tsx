"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Activity as ActivityIcon, Star, Bookmark, ShieldAlert, Sparkles, Heart } from "lucide-react";
import { MOCK_ACTIVITIES, MOCK_REVIEWS } from "@/lib/tmdb/mockData";
import { SpoilerReviewCard } from "@/components/reviews/SpoilerReviewCard";
import { getTMDBImageUrl } from "@/lib/utils";

export default function FeedPage() {
  const [filter, setFilter] = useState<"all" | "reviews" | "ratings">("all");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
            <ActivityIcon className="w-3.5 h-3.5" />
            <span>Community Stream</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Social TV Feed</h1>
          <p className="text-sm text-neutral-400 mt-1">
            See what your friends and the television community are watching, rating, and reviewing.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-white/10 text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === "all" ? "bg-rose-600 text-white font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilter("reviews")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === "reviews" ? "bg-rose-600 text-white font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            Reviews
          </button>
          <button
            onClick={() => setFilter("ratings")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === "ratings" ? "bg-rose-600 text-white font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            Ratings
          </button>
        </div>
      </div>

      {/* Feed Items */}
      <div className="space-y-6">
        {/* Activity 1: Season Rating */}
        {(filter === "all" || filter === "ratings") && (
          <div className="p-4 rounded-2xl bg-[#12141c]/90 border border-white/10 hover:border-white/15 transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              ET
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-neutral-400">
                  <strong className="text-white hover:text-rose-400">Elena Torres</strong> (@elena_t) rated a season:
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">2h ago</span>
              </div>

              <div className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                  <Image
                    src={getTMDBImageUrl("/bU6V9Xj2e6F866w5lYq2zLzYnUv.jpg", "w185")}
                    alt="Severance"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <Link href="/show/93405" className="text-sm font-bold text-white hover:text-rose-400">
                    Severance
                  </Link>
                  <div className="text-xs text-neutral-400 mt-0.5">Season 1</div>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-bold mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>5.0 / 5.0</span>
                    <span className="text-[11px] text-rose-400 font-semibold ml-2">#1 Season of 2022</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews in Feed */}
        {(filter === "all" || filter === "reviews") && (
          <>
            {MOCK_REVIEWS.map((review) => (
              <SpoilerReviewCard key={review.id} review={review} />
            ))}
          </>
        )}

        {/* Activity: Watchlist status change */}
        {(filter === "all" || filter === "ratings") && (
          <div className="p-4 rounded-2xl bg-[#12141c]/90 border border-white/10 hover:border-white/15 transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              SJ
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-neutral-400">
                  <strong className="text-white hover:text-rose-400">Sarah Jenkins</strong> started watching:
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">5h ago</span>
              </div>

              <div className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                  <Image
                    src={getTMDBImageUrl("/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg", "w185")}
                    alt="Shōgun"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <Link href="/show/126308" className="text-sm font-bold text-white hover:text-rose-400">
                    Shōgun
                  </Link>
                  <div className="text-xs text-rose-400 font-semibold mt-0.5">Marked as &ldquo;Watching&rdquo;</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
