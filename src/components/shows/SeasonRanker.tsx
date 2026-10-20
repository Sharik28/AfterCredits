"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Award, ChevronRight, Check } from "lucide-react";
import { Season, TVShow } from "@/types";
import { getTMDBImageUrl, formatAirYear, cn } from "@/lib/utils";

interface SeasonRankerProps {
  show: TVShow;
}

interface SeasonUserRating {
  rating: number;
  rank?: number;
}

function SeasonPosterThumbnail({ src, name }: { src: string; name: string }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-bold">
        S
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={name}
      fill
      sizes="48px"
      className="object-cover"
      onError={() => setError(true)}
    />
  );
}

export function SeasonRanker({ show }: SeasonRankerProps) {
  const seasons = show.seasons || [];
  const [ratings, setRatings] = useState<Record<number, SeasonUserRating>>({});
  const [hoveredStar, setHoveredStar] = useState<{ seasonNum: number; star: number } | null>(null);

  // Load saved season ratings from localStorage
  const storageKey = `aftercredits_season_ratings_${show.id}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setRatings(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load season ratings", e);
    }
  }, [storageKey]);

  const handleRate = (seasonNum: number, rating: number) => {
    const next = {
      ...ratings,
      [seasonNum]: {
        ...ratings[seasonNum],
        rating,
      },
    };
    setRatings(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to save season rating", e);
    }
  };

  if (!seasons || seasons.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Seasons & Episodic Rankings</span>
            <span className="text-xs font-normal text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              AfterCredits Exclusive
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            TV shows fluctuate season-by-season. Rate each season independently to build your personal ranking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {seasons.map((season) => {
          const userSeasonRating = ratings[season.season_number]?.rating || 0;
          const poster = getTMDBImageUrl(season.poster_path || show.poster_path, "w185");

          return (
            <div
              key={season.season_number}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#12141c]/90 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Season mini poster */}
                <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                  <SeasonPosterThumbnail src={poster} name={season.name} />
                </div>

                {/* Season Metadata */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{season.name}</h4>
                    {season.air_date && (
                      <span className="text-xs text-neutral-400 font-mono">
                        ({formatAirYear(season.air_date)})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {season.episode_count} {season.episode_count === 1 ? "Episode" : "Episodes"}
                  </p>
                  {season.overview && (
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1 max-w-xl hidden md:block">
                      {season.overview}
                    </p>
                  )}
                </div>
              </div>

              {/* Interactive Season Rating Widget */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-1 bg-neutral-900/90 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="text-[11px] uppercase font-bold text-neutral-400 mr-1">
                    Your Rating:
                  </span>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isHovered =
                      hoveredStar?.seasonNum === season.season_number &&
                      hoveredStar.star >= star;
                    const isFilled = isHovered || (!hoveredStar && userSeasonRating >= star);

                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() =>
                          setHoveredStar({ seasonNum: season.season_number, star })
                        }
                        onMouseLeave={() => setHoveredStar(null)}
                        onClick={() => handleRate(season.season_number, star)}
                        className="p-0.5 text-neutral-600 hover:scale-125 transition-transform"
                        title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isFilled
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-600 hover:text-neutral-400"
                          )}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-1 text-xs font-mono font-bold text-amber-400 min-w-4 text-right">
                    {userSeasonRating > 0 ? `${userSeasonRating}.0` : "—"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
