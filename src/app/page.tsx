import Image from "next/image";
import Link from "next/link";
import { Star, Shield, Award, Sparkles, ArrowRight, Play, Bookmark, CheckCircle2 } from "lucide-react";
import { getTrendingShows } from "@/lib/tmdb/client";
import { PosterCard } from "@/components/shows/PosterCard";
import { SpoilerReviewCard } from "@/components/reviews/SpoilerReviewCard";
import { MOCK_REVIEWS } from "@/lib/tmdb/mockData";
import { getTMDBImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const trendingShows = await getTrendingShows();
  const heroShow = trendingShows[0] || null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Showcase Section */}
      <section className="relative w-full min-h-[620px] flex items-center justify-center overflow-hidden border-b border-white/10">
        {heroShow?.backdrop_path && (
          <div className="absolute inset-0 z-0">
            <Image
              src={getTMDBImageUrl(heroShow.backdrop_path, "original")}
              alt={heroShow.name}
              fill
              priority
              className="object-cover object-top opacity-35 scale-105 filter blur-[1px]"
            />
            {/* Multi-layered cinematic vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/70 to-[#090a0f]/40" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#090a0f]/60 to-[#090a0f]" />
          </div>
        )}

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center flex flex-col items-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold tracking-wide uppercase mb-6 shadow-lg shadow-rose-950/40">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>The Social Platform for Television</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08]">
            Your TV life, <br />
            <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-amber-300 bg-clip-text text-transparent">
              documented.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-neutral-300 max-w-2xl font-normal leading-relaxed">
            Letterboxd was built for two-hour films. <strong>AfterCredits</strong> is built for the golden age of television: season-specific ratings, spoiler-safe discussion, and friends who share your taste.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/discover"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-xl shadow-rose-950/50 hover:shadow-rose-900/40 active:scale-95"
            >
              <span>Explore TV Shows</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/watchlist"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 hover:border-white/25 backdrop-blur-md transition-all active:scale-95"
            >
              <Bookmark className="w-4 h-4 text-rose-400" />
              <span>Open My Watchlist</span>
            </Link>
          </div>

          {/* Value Props Bullet Pills */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/70 border border-white/10 text-left">
              <div className="p-2 rounded-lg bg-rose-600/20 text-rose-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">Rate Every Season</span>
                <span className="text-neutral-400">Because S1 and S2 aren&apos;t the same.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/70 border border-white/10 text-left">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">Spoiler-Safe Shrouds</span>
                <span className="text-neutral-400">Concealed until you tap reveal.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/70 border border-white/10 text-left">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">Effortless Tracking</span>
                <span className="text-neutral-400">Watching, Want to Watch, Completed.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
              <Play className="w-3.5 h-3.5 fill-rose-500" />
              <span>Trending Shows</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              What the world is watching
            </h2>
          </div>

          <Link
            href="/discover"
            className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Browse all shows</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Poster Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {trendingShows.slice(0, 6).map((show, idx) => (
            <PosterCard key={show.id} show={show} priority={idx < 4} />
          ))}
        </div>
      </section>

      {/* Community Discourse & Spoiler-Safe Reviews Section */}
      <section className="bg-[#0b0c12] border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Community Reviews</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Honest, spoiler-protected discussion
              </h2>
            </div>

            <Link
              href="/feed"
              className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View social feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_REVIEWS.map((review) => (
              <SpoilerReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
