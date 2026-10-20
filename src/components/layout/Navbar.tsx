"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Film,
  Compass,
  Bookmark,
  Calendar,
  Activity,
  Search,
  Menu,
  X,
  User,
  Tv,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/store/watchlistStore";
import { useAuth } from "@/lib/auth/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items: watchlistItems } = useWatchlist();
  const { user, openAuthModal, signOut, isDemoUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/feed", label: "Feed", icon: Activity },
    {
      href: "/watchlist",
      label: "Watchlist",
      icon: Bookmark,
      badge: watchlistItems.length > 0 ? watchlistItems.length : undefined,
    },
    { href: "/diary", label: "Diary", icon: Calendar },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 border-b",
        scrolled
          ? "bg-[#090a0f]/90 backdrop-blur-md border-white/10 shadow-2xl"
          : "bg-[#090a0f]/60 backdrop-blur-sm border-white/5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform duration-200">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-lg text-white group-hover:text-rose-400 transition-colors">
              After<span className="text-rose-500">Credits</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-neutral-400 -mt-1 font-medium">
              Your TV life, documented
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-white bg-white/10 shadow-inner"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-rose-500" : "text-neutral-400")} />
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 text-[11px] font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Search & Profile / Auth */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/discover"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/80 border border-white/10 text-xs text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-all w-44"
          >
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <span>Search shows...</span>
            <kbd className="ml-auto text-[10px] bg-neutral-800 text-neutral-400 px-1 rounded border border-neutral-700">
              /
            </kbd>
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-neutral-900/90 border border-white/10 hover:border-white/20 transition-all text-xs font-medium text-neutral-300"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                  {user.username.slice(0, 2)}
                </div>
                <span className="max-w-24 truncate">{user.displayName || user.username}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#12141c] border border-white/15 p-2 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="font-bold text-white truncate">{user.displayName}</p>
                    <p className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
                      <span>@{user.username}</span>
                      {isDemoUser && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                          Demo
                        </span>
                      )}
                    </p>
                  </div>

                  <Link
                    href={`/u/${user.username}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-rose-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/watchlist"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-rose-400" />
                    <span>My Watchlist ({watchlistItems.length})</span>
                  </Link>

                  <div className="pt-1 border-t border-white/5">
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("signin")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal("signup")}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0e15] border-b border-white/10 px-4 pt-2 pb-4 space-y-2">
          <div className="mb-3">
            <Link
              href="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-sm text-neutral-400"
            >
              <Search className="w-4 h-4 text-neutral-500" />
              <span>Search shows...</span>
            </Link>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "text-white bg-rose-500/15 border border-rose-500/30"
                    : "text-neutral-300 hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4", isActive ? "text-rose-500" : "text-neutral-400")} />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-300">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Mobile Auth Section */}
          <div className="pt-3 mt-2 border-t border-white/10">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-neutral-900 border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-xs text-white font-bold uppercase">
                    {user.username.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-neutral-400 font-mono">@{user.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/u/${user.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("signin");
                  }}
                  className="flex-1 py-2 rounded-lg bg-neutral-900 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("signup");
                  }}
                  className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/50"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
