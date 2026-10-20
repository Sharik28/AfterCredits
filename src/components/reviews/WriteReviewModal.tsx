"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Tv, ShieldAlert, ChevronDown, PenLine, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { TVShow, Review } from "@/types";
import { cn } from "@/lib/utils";
import { StarRatingInput } from "./StarRatingInput";
import { submitReviewAction } from "@/lib/reviews/actions";
import { useAuth } from "@/lib/auth/AuthContext";

interface WriteReviewModalProps {
  show: TVShow;
  isOpen: boolean;
  onClose: () => void;
  /** Called with the newly created Review so the parent can prepend it to its list */
  onReviewSubmitted?: (review: Review) => void;
}

const MIN_CHARS = 10;
const MAX_CHARS = 3000;

export function WriteReviewModal({
  show,
  isOpen,
  onClose,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const { user, openAuthModal } = useAuth();

  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState("");
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [spoilerSeason, setSpoilerSeason] = useState<number | "">("");
  const [spoilerEpisode, setSpoilerEpisode] = useState<number | "">("");
  const [seasonFocus, setSeasonFocus] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setContent("");
      setHasSpoilers(false);
      setSpoilerSeason("");
      setSpoilerEpisode("");
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsSubmitting(false);
      // Auto-focus textarea after animation
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isUnderMin = charCount < MIN_CHARS;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user) {
        onClose();
        openAuthModal("signin");
        return;
      }

      setErrorMsg(null);
      setSuccessMsg(null);

      if (isUnderMin) {
        setErrorMsg(`Your review needs at least ${MIN_CHARS} characters.`);
        return;
      }
      if (isOverLimit) {
        setErrorMsg(`Your review is too long (max ${MAX_CHARS.toLocaleString()} characters).`);
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await submitReviewAction({
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          showId: show.id,
          showName: show.name,
          showPoster: show.poster_path,
          seasonId: null,
          seasonNumber: spoilerSeason !== "" ? Number(spoilerSeason) : null,
          rating: rating > 0 ? rating : null,
          content,
          hasSpoilers,
          spoilersUpToSeason: hasSpoilers && spoilerSeason !== "" ? Number(spoilerSeason) : null,
          spoilersUpToEpisode:
            hasSpoilers && spoilerEpisode !== "" ? Number(spoilerEpisode) : null,
        });

        if (result.success && result.review) {
          setSuccessMsg("Review posted! Great contribution to the community.");
          onReviewSubmitted?.(result.review);
          // Auto-close after 1.4 s
          setTimeout(() => {
            onClose();
          }, 1400);
        } else {
          setErrorMsg(result.error ?? "Something went wrong. Please try again.");
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Unexpected error occurred.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      user,
      content,
      rating,
      hasSpoilers,
      spoilerSeason,
      spoilerEpisode,
      show,
      isUnderMin,
      isOverLimit,
      onClose,
      openAuthModal,
      onReviewSubmitted,
    ]
  );

  if (!isOpen) return null;

  const seasons = show.seasons?.filter((s) => s.season_number > 0) ?? [];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0f1118] border border-white/12 shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-950/60 shrink-0">
              <PenLine className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight leading-tight">
                Write a Review
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5">
                <Tv className="w-3 h-3 text-rose-400" />
                <span className="text-rose-300 font-semibold">{show.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/8 transition-colors shrink-0"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Your Rating <span className="text-neutral-600 font-normal normal-case">(optional)</span>
            </label>
            <div className="flex justify-center py-2">
              <StarRatingInput value={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          {/* Review Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="review-content"
                className="text-xs font-bold uppercase tracking-wider text-neutral-400"
              >
                Your Review <span className="text-rose-500">*</span>
              </label>
              <span
                className={cn(
                  "text-[11px] font-mono transition-colors",
                  isOverLimit
                    ? "text-red-400 font-bold"
                    : charCount > MAX_CHARS * 0.85
                    ? "text-amber-400"
                    : "text-neutral-500"
                )}
              >
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>
            <textarea
              id="review-content"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder={`Share your thoughts on ${show.name}… What made it stand out? Would you recommend it?`}
              className="w-full px-4 py-3 rounded-2xl bg-[#12141c] border border-white/8 text-sm text-neutral-100 placeholder-neutral-600 resize-none focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all leading-relaxed"
            />
            {isUnderMin && charCount > 0 && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                {MIN_CHARS - charCount} more characters needed.
              </p>
            )}
          </div>

          {/* Spoiler Toggle */}
          <div className="rounded-2xl border border-white/8 bg-[#12141c] overflow-hidden">
            <button
              type="button"
              onClick={() => setHasSpoilers((prev) => !prev)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors",
                hasSpoilers
                  ? "bg-rose-950/40 text-rose-300"
                  : "text-neutral-300 hover:bg-white/4 hover:text-white"
              )}
            >
              <span className="flex items-center gap-2.5">
                <ShieldAlert
                  className={cn("w-4 h-4", hasSpoilers ? "text-rose-400" : "text-neutral-500")}
                />
                <span>
                  {hasSpoilers ? "⚠️ Spoiler Warning Enabled" : "Contains Spoilers?"}
                </span>
              </span>
              <div
                className={cn(
                  "relative w-9 h-5 rounded-full border transition-all duration-200 shrink-0",
                  hasSpoilers
                    ? "bg-rose-600 border-rose-500"
                    : "bg-neutral-800 border-neutral-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                    hasSpoilers ? "left-4" : "left-0.5"
                  )}
                />
              </div>
            </button>

            {hasSpoilers && (
              <div className="px-4 pb-4 pt-1 border-t border-rose-500/15 bg-rose-950/10">
                <p className="text-[11px] text-rose-300/70 mb-3">
                  Specify how far into the show your spoilers extend (optional):
                </p>
                <div className="flex items-center gap-3">
                  {/* Season selector */}
                  <div className="flex-1 relative">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      Up to Season
                    </label>
                    <div className="relative">
                      <select
                        value={spoilerSeason}
                        onChange={(e) =>
                          setSpoilerSeason(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        onFocus={() => setSeasonFocus(true)}
                        onBlur={() => setSeasonFocus(false)}
                        className="w-full appearance-none bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50 cursor-pointer pr-8"
                      >
                        <option value="">Any / Not specified</option>
                        {seasons.length > 0
                          ? seasons.map((s) => (
                              <option key={s.season_number} value={s.season_number}>
                                Season {s.season_number}
                                {s.name && s.name !== `Season ${s.season_number}`
                                  ? ` — ${s.name}`
                                  : ""}
                              </option>
                            ))
                          : Array.from({ length: show.number_of_seasons }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Season {i + 1}
                              </option>
                            ))}
                      </select>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 absolute right-2.5 top-2.5 text-neutral-500 pointer-events-none transition-transform",
                          seasonFocus && "rotate-180"
                        )}
                      />
                    </div>
                  </div>

                  {/* Episode selector */}
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      Up to Episode
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      placeholder="Ep #"
                      value={spoilerEpisode}
                      onChange={(e) =>
                        setSpoilerEpisode(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success / Error Alerts */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/12 border border-red-500/25 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-white/8 text-sm font-semibold text-neutral-300 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverLimit}
              className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting…</span>
                </>
              ) : (
                <span>{!user ? "Sign In to Post" : "Post Review"}</span>
              )}
            </button>
          </div>

          {!user && (
            <p className="text-center text-[11px] text-neutral-500">
              You need to be signed in to post a review.{" "}
              <button
                type="button"
                onClick={() => { onClose(); openAuthModal("signup"); }}
                className="text-rose-400 hover:text-rose-300 underline underline-offset-2"
              >
                Create a free account
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
