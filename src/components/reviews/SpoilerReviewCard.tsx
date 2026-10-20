"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShieldAlert, Eye, Heart, MessageSquare } from "lucide-react";
import { Review } from "@/types";
import { cn } from "@/lib/utils";

interface SpoilerReviewCardProps {
  review: Review;
}

export function SpoilerReviewCard({ review }: SpoilerReviewCardProps) {
  const [isRevealed, setIsRevealed] = useState(!review.has_spoilers);
  const [isLiked, setIsLiked] = useState(review.is_liked_by_me || false);
  const [likeCount, setLikeCount] = useState(review.likes_count || 0);

  const toggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const formattedDate = new Date(review.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-5 rounded-2xl bg-[#12141c]/90 border border-white/10 hover:border-white/15 transition-all space-y-4">
      {/* Header: User info, show info, rating */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {review.user_profile?.avatar_url ? (
            <Image
              src={review.user_profile.avatar_url}
              alt={review.user_profile.display_name}
              width={40}
              height={40}
              className="rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-rose-900/60 border border-rose-500/30 flex items-center justify-center font-bold text-rose-200 text-xs">
              {review.user_profile?.username?.slice(0, 2).toUpperCase() || "TV"}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/u/${review.user_profile?.username || "user"}`}
                className="text-sm font-bold text-white hover:text-rose-400 transition-colors"
              >
                {review.user_profile?.display_name || "Viewer"}
              </Link>
              <span className="text-xs text-neutral-400">
                @{review.user_profile?.username}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span>Reviewed</span>
              <Link
                href={`/show/${review.show_id}`}
                className="font-semibold text-neutral-300 hover:text-rose-400"
              >
                {review.show_name}
              </Link>
              {review.season_number && (
                <span className="text-rose-400 font-mono text-[11px] bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                  Season {review.season_number}
                </span>
              )}
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Stars */}
        {review.rating && (
          <div className="flex items-center gap-1 bg-neutral-900/90 px-2.5 py-1 rounded-full border border-white/10 text-xs font-semibold text-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{review.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Review Content & Spoiler Shroud */}
      <div className="relative">
        {review.has_spoilers && !isRevealed ? (
          <div className="relative rounded-xl overflow-hidden border border-rose-500/30 bg-rose-950/20 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>
                Spoiler Alert
                {review.spoilers_up_to_season &&
                  ` (Includes Season ${review.spoilers_up_to_season}${
                    review.spoilers_up_to_episode ? `, Ep ${review.spoilers_up_to_episode}` : ""
                  })`}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-md">
              This review contains major plot details. It is hidden by default to preserve your viewing experience.
            </p>
            <button
              onClick={() => setIsRevealed(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-lg active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal Spoiler</span>
            </button>
          </div>
        ) : (
          <div className="relative">
            {review.has_spoilers && (
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Spoiler Revealed
                </span>
                <button
                  onClick={() => setIsRevealed(false)}
                  className="text-[11px] text-neutral-500 hover:text-neutral-300 underline"
                >
                  Hide again
                </button>
              </div>
            )}
            <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
              {review.content}
            </p>
          </div>
        )}
      </div>

      {/* Footer: Likes and replies */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-neutral-400">
        <button
          onClick={toggleLike}
          className={cn(
            "flex items-center gap-1.5 transition-colors",
            isLiked ? "text-rose-500 font-semibold" : "hover:text-rose-400"
          )}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-rose-500")} />
          <span>{likeCount} likes</span>
        </button>

        <span className="text-[11px] text-neutral-500 font-mono">
          AfterCredits Verified Fan
        </span>
      </div>
    </div>
  );
}
