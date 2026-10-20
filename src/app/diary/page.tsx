"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar as CalendarIcon, Star, Plus, CheckCircle2 } from "lucide-react";
import { getTMDBImageUrl } from "@/lib/utils";

interface DiaryEntry {
  id: string;
  show_id: number;
  show_name: string;
  poster_path: string;
  season_number: number;
  episode_number: number;
  episode_title: string;
  watched_date: string;
  rating: number;
  notes?: string;
}

const INITIAL_DIARY: DiaryEntry[] = [
  {
    id: "d-1",
    show_id: 93405,
    show_name: "Severance",
    poster_path: "/bU6V9Xj2e6F866w5lYq2zLzYnUv.jpg",
    season_number: 1,
    episode_number: 9,
    episode_title: "The We We Are",
    watched_date: "Today",
    rating: 5.0,
    notes: "Rewatched before Season 2 starts. Still completely breathtaking.",
  },
  {
    id: "d-2",
    show_id: 139677,
    show_name: "The Bear",
    poster_path: "/6GkKzdU6Z8N7v8F3m2L1a4P5.jpg",
    season_number: 2,
    episode_number: 7,
    episode_title: "Forks",
    watched_date: "Yesterday",
    rating: 5.0,
    notes: "Richie wearing the suit. 'I wear suits now.' Unmatched character arc.",
  },
  {
    id: "d-3",
    show_id: 126308,
    show_name: "Shōgun",
    poster_path: "/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
    season_number: 1,
    episode_number: 1,
    episode_title: "Anjin",
    watched_date: "Oct 18, 2026",
    rating: 4.5,
    notes: "Atmospheric, brutal, and gorgeously filmed.",
  },
];

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>(INITIAL_DIARY);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Personal Log</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Viewing Diary</h1>
          <p className="text-sm text-neutral-400 mt-1">
            A chronological timeline of every episode and season you&apos;ve watched.
          </p>
        </div>

        <Link
          href="/discover"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950/50 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Episode</span>
        </Link>
      </div>

      {/* Diary Timeline */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#12141c]/90 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                <Image
                  src={getTMDBImageUrl(entry.poster_path, "w185")}
                  alt={entry.show_name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/show/${entry.show_id}`}
                    className="text-sm font-bold text-white hover:text-rose-400 truncate"
                  >
                    {entry.show_name}
                  </Link>
                  <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    S{entry.season_number} • E{entry.episode_number}
                  </span>
                </div>
                <div className="text-xs text-neutral-300 font-medium mt-0.5">
                  &ldquo;{entry.episode_title}&rdquo;
                </div>
                {entry.notes && (
                  <p className="text-xs text-neutral-400 mt-1 italic line-clamp-1">
                    {entry.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
              <div className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-neutral-900 px-2.5 py-1 rounded-lg border border-white/5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{entry.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-neutral-500 font-mono min-w-20 text-right">
                {entry.watched_date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
