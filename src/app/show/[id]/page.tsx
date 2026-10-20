import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Calendar,
  Layers,
  Tv,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { getShowDetails } from "@/lib/tmdb/client";
import { getTMDBImageUrl, formatAirYear, formatRating } from "@/lib/utils";
import { WatchlistButton } from "@/components/shows/WatchlistButton";
import { SeasonRanker } from "@/components/shows/SeasonRanker";
import { ShowReviewsSection } from "@/components/reviews/ShowReviewsSection";
import { MOCK_REVIEWS } from "@/lib/tmdb/mockData";

export const dynamic = "force-dynamic";

interface ShowPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShowPage({ params }: ShowPageProps) {
  const { id } = await params;
  const showId = parseInt(id, 10);

  if (isNaN(showId)) {
    notFound();
  }

  const show = await getShowDetails(showId);

  if (!show) {
    notFound();
  }

  const backdropUrl = getTMDBImageUrl(show.backdrop_path, "original");
  const posterUrl = getTMDBImageUrl(show.poster_path, "w780");
  const year = formatAirYear(show.first_air_date);
  const rating = formatRating(show.vote_average);

  // Reviews matching this show
  const showReviews = MOCK_REVIEWS.filter((r) => r.show_id === show.id);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Backdrop Banner */}
      <div className="relative w-full h-[450px] sm:h-[550px] overflow-hidden border-b border-white/10">
        {show.backdrop_path && (
          <Image
            src={backdropUrl}
            alt={show.name}
            fill
            priority
            className="object-cover object-top opacity-30 filter blur-[0.5px] scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-transparent to-[#090a0f]/80" />

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white hover:border-white/20 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discover</span>
          </Link>
        </div>
      </div>

      {/* Main Content Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-64 sm:-mt-72 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big Poster */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center sm:items-start">
            <div className="relative w-56 sm:w-full aspect-[2/3] rounded-3xl overflow-hidden bg-neutral-900 border-2 border-white/15 shadow-2xl shadow-black/90">
              {show.poster_path ? (
                <Image
                  src={posterUrl}
                  alt={show.name}
                  fill
                  sizes="(max-width: 768px) 250px, 350px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-500 font-bold">
                  No Poster
                </div>
              )}
            </div>

            {/* Quick Watchlist Action below poster */}
            <div className="w-full mt-4">
              <WatchlistButton show={show} className="w-full" />
            </div>
          </div>

          {/* Right Column: Title, Metadata, Overview */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <div>
              {show.tagline && (
                <p className="text-xs uppercase font-bold tracking-widest text-rose-400 mb-2 font-mono">
                  &ldquo;{show.tagline}&rdquo;
                </p>
              )}
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {show.name}
              </h1>

              {/* Badges / Quick stats */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-300">
                {/* Year */}
                <div className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{year}</span>
                </div>

                <span>•</span>

                {/* Seasons */}
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-neutral-500" />
                  <span>
                    {show.number_of_seasons} {show.number_of_seasons === 1 ? "Season" : "Seasons"}
                  </span>
                  {show.number_of_episodes > 0 && (
                    <span className="text-neutral-500 font-mono">
                      ({show.number_of_episodes} eps)
                    </span>
                  )}
                </div>

                <span>•</span>

                {/* Status */}
                <div className="px-2 py-0.5 rounded-full bg-neutral-800 border border-white/10 text-[11px] font-semibold text-neutral-300">
                  {show.status}
                </div>

                <span>•</span>

                {/* Rating */}
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rating}</span>
                  {show.vote_count && (
                    <span className="text-[10px] text-amber-400/80 font-normal">
                      ({show.vote_count.toLocaleString()})
                    </span>
                  )}
                </div>
              </div>

              {/* Genre Pills */}
              {show.genres && show.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {show.genres.map((g) => (
                    <span
                      key={g.id}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-300 font-medium"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
                Synopsis
              </h3>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-4xl">
                {show.overview || "No overview available for this series."}
              </p>
            </div>

            {/* Differentiator 1: Season-Specific Ratings & Personal Rankings */}
            <div className="pt-6 border-t border-white/10">
              <SeasonRanker show={show} />
            </div>

            {/* Community Reviews Section */}
            <ShowReviewsSection show={show} initialReviews={showReviews} />
          </div>
        </div>
      </div>
    </div>
  );
}
