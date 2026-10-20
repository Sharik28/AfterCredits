import Link from "next/link";
import { Tv, Heart, Shield, Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#07080b] text-neutral-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                <Tv className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white tracking-tight text-base">
                After<span className="text-rose-500">Credits</span>
              </span>
            </div>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              Your TV life, documented. Rate individual seasons, curate your watchlist, and share spoiler-safe reviews with a community of real television enthusiasts.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                MVP Release v0.1
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/discover" className="hover:text-rose-400 transition-colors">
                  Discover Shows
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-rose-400 transition-colors">
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link href="/feed" className="hover:text-rose-400 transition-colors">
                  Social Feed
                </Link>
              </li>
              <li>
                <Link href="/diary" className="hover:text-rose-400 transition-colors">
                  Viewing Diary
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Attribution */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Data & Attribution
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
            <div className="pt-1">
              <div className="inline-block px-2 py-1 rounded bg-neutral-900 border border-white/10 text-[11px] text-neutral-400 font-mono">
                TMDB Metadata
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} AfterCredits. Built for passionate TV lovers.</p>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="hover:text-neutral-300 transition-colors">
              Settings & API Keys
            </Link>
            <span>•</span>
            <span className="text-neutral-500 flex items-center gap-1">
              Spoiler-Safe Certified <Shield className="w-3.5 h-3.5 text-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
