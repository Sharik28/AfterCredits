"use client";

import { useState, useCallback } from "react";
import { PenLine, MessageSquare } from "lucide-react";
import { TVShow, Review } from "@/types";
import { SpoilerReviewCard } from "@/components/reviews/SpoilerReviewCard";
import { WriteReviewModal } from "@/components/reviews/WriteReviewModal";
import { useAuth } from "@/lib/auth/AuthContext";

interface ShowReviewsSectionProps {
  show: TVShow;
  initialReviews: Review[];
}

export function ShowReviewsSection({ show, initialReviews }: ShowReviewsSectionProps) {
  const { user, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    setIsModalOpen(true);
  };

  const handleReviewSubmitted = useCallback((newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
  }, []);

  return (
    <>
      <div className="pt-8 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" />
              <span>Fan Reviews</span>
              {reviews.length > 0 && (
                <span className="ml-1 text-sm font-mono text-neutral-400">({reviews.length})</span>
              )}
            </h3>
            <p className="text-xs text-neutral-400">
              Community discussions with built-in spoiler protection.
            </p>
          </div>

          {/* Write a Review CTA */}
          <button
            id="write-review-btn"
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 hover:border-white/20 text-xs font-semibold text-neutral-200 hover:text-white transition-all active:scale-95 group"
          >
            <PenLine className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-300 transition-colors" />
            <span>Write a Review</span>
          </button>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <SpoilerReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-2xl bg-[#12141c]/50 border border-white/5 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-neutral-700 mx-auto" />
            <p className="text-xs text-neutral-400">
              No community reviews posted for{" "}
              <span className="text-neutral-300 font-semibold">{show.name}</span> yet.
            </p>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950/40 active:scale-95"
            >
              <PenLine className="w-3.5 h-3.5" />
              Be the first to leave a review
            </button>
          </div>
        )}
      </div>

      <WriteReviewModal
        show={show}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  );
}
