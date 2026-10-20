import Image from "next/image";
import Link from "next/link";
import { Star, Tv, Layers, Clock, Award, Bookmark, Calendar } from "lucide-react";
import { MOCK_SHOWS, MOCK_REVIEWS } from "@/lib/tmdb/mockData";
import { PosterCard } from "@/components/shows/PosterCard";
import { SpoilerReviewCard } from "@/components/reviews/SpoilerReviewCard";
import { getTMDBImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Favorite 4 shows (Letterboxd staple)
  const favoriteShows = MOCK_SHOWS.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header Shell */}
      <div className="relative rounded-3xl overflow-hidden bg-[#12141c]/90 border border-white/10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-1 shadow-2xl shrink-0">
            <div className="w-full h-full rounded-full bg-[#090a0f] flex items-center justify-center text-2xl font-black text-white">
              {username.slice(0, 2).toUpperCase()}
            </div>
          </div>

          {/* User Bio & Handle */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white capitalize">
                  {username.replace("_", " ")}
                </h1>
                <p className="text-xs text-rose-400 font-mono">@{username}</p>
              </div>

              <div className="flex items-center gap-2 self-center sm:self-auto">
                <Link
                  href="/settings"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            <p className="text-sm text-neutral-300 max-w-xl">
              Television obsessive. Ranking prestige drama seasons since 2018. Believes Succession Season 2 is the peak of modern writing.
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-neutral-400 pt-1 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" /> Joined Oct 2024
              </span>
              <span>•</span>
              <span className="text-white"><strong>42</strong> Following</span>
              <span>•</span>
              <span className="text-white"><strong>128</strong> Followers</span>
            </div>
          </div>
        </div>

        {/* Viewing Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/5">
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-rose-500 mb-1">
              <Tv className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Shows</span>
            </div>
            <div className="text-2xl font-black text-white">28</div>
            <div className="text-[11px] text-neutral-500">logged in catalog</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Seasons</span>
            </div>
            <div className="text-2xl font-black text-white">74</div>
            <div className="text-[11px] text-neutral-500">rated individually</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Watch Time</span>
            </div>
            <div className="text-2xl font-black text-white">512h</div>
            <div className="text-[11px] text-neutral-500">total time invested</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Avg Rating</span>
            </div>
            <div className="text-2xl font-black text-white">4.3</div>
            <div className="text-[11px] text-neutral-500">out of 5.0 stars</div>
          </div>
        </div>
      </div>

      {/* Favorite Four Shows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Favorite 4 Shows</span>
            </h2>
            <p className="text-xs text-neutral-400">
              The four foundational television series that define this viewer&apos;s taste.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {favoriteShows.map((show) => (
            <PosterCard key={show.id} show={show} />
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h2 className="text-xl font-bold text-white">Recent Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_REVIEWS.slice(0, 2).map((review) => (
            <SpoilerReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}
