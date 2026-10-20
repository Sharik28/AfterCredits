"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, Sparkles, AlertCircle } from "lucide-react";
import { TVShow } from "@/types";
import { PosterCard } from "@/components/shows/PosterCard";
import { MOCK_SHOWS } from "@/lib/tmdb/mockData";
import { isTMDBConfigured } from "@/lib/tmdb/client";

const GENRES = [
  { id: 0, name: "All Genres" },
  { id: 18, name: "Drama" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 9648, name: "Mystery" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 16, name: "Animation" },
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [shows, setShows] = useState<TVShow[]>(MOCK_SHOWS);
  const [isSearching, setIsSearching] = useState(false);
  const [hasTMDB, setHasTMDB] = useState(false);

  useEffect(() => {
    setHasTMDB(isTMDBConfigured());
  }, []);

  // Fetch or filter shows
  useEffect(() => {
    let active = true;

    async function loadShows() {
      setIsSearching(true);
      if (searchQuery.trim().length > 0) {
        try {
          const res = await fetch(`/api/shows/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            if (active && data.results) {
              setShows(data.results);
              setIsSearching(false);
              return;
            }
          }
        } catch {
          // Fallback to local filter
        }
      }

      // Local filter fallback
      const q = searchQuery.toLowerCase();
      const filtered = MOCK_SHOWS.filter((s) => {
        const matchesQuery =
          !q ||
          s.name.toLowerCase().includes(q) ||
          (s.overview && s.overview.toLowerCase().includes(q));
        const matchesGenre =
          selectedGenre === 0 ||
          (s.genres && s.genres.some((g) => g.id === selectedGenre));
        return matchesQuery && matchesGenre;
      });

      if (active) {
        setShows(filtered);
        setIsSearching(false);
      }
    }

    const timer = setTimeout(loadShows, 180);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedGenre]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TV Catalog & Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Discover Television
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Explore acclaimed series, search by title, and add shows to your personal watchlist.
          </p>
        </div>

        {/* Demo Mode / API status indicator */}
        {!hasTMDB && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs self-start md:self-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Curated offline catalog. Add TMDB key in Settings for full database.</span>
          </div>
        )}
      </div>

      {/* Search & Genre Filters Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shows by name, creator, or keywords (e.g., 'Severance', 'Succession')..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#12141c] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Genre Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((genre) => {
            const isSelected = selectedGenre === genre.id;
            return (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                    : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-white/5"
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-white/5 pb-2">
          <span>
            Showing <strong className="text-white">{shows.length}</strong> shows
            {searchQuery && ` for "${searchQuery}"`}
          </span>
          {isSearching && <span className="text-rose-400 animate-pulse">Updating...</span>}
        </div>

        {shows.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {shows.map((show) => (
              <PosterCard key={show.id} show={show} />
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-3xl bg-[#12141c]/50 border border-white/5 text-center flex flex-col items-center justify-center space-y-3">
            <p className="text-lg font-bold text-neutral-300">No shows found</p>
            <p className="text-xs text-neutral-500 max-w-sm">
              We couldn&apos;t find any television shows matching your search criteria. Try a different query or select another genre.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre(0);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
