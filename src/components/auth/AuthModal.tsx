"use client";

import { useState } from "react";
import { X, Tv, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    signIn,
    signUp,
    signInDemoUser,
    isSupabaseAvailable,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const isSignUp = authModalMode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!username || username.trim().length < 3) {
          setErrorMessage("Username must be at least 3 characters.");
          setIsSubmitting(false);
          return;
        }
        const res = await signUp(email, password, username, displayName || username);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to sign up.");
        } else {
          setSuccessMessage("Account created successfully!");
        }
      } else {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to sign in.");
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0f1118] border border-white/15 p-6 sm:p-8 shadow-2xl text-left shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-950/60">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {isSignUp ? "Join AfterCredits" : "Welcome Back"}
            </h2>
            <p className="text-xs text-neutral-400">
              {isSignUp
                ? "Document your TV life and rate every season."
                : "Sign in to access your TV watchlist and diary."}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 rounded-xl bg-neutral-900 border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              openAuthModal("signin");
            }}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              !isSignUp ? "bg-rose-600 text-white shadow-md" : "text-neutral-400 hover:text-white"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              openAuthModal("signup");
            }}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
              isSignUp ? "bg-rose-600 text-white shadow-md" : "text-neutral-400 hover:text-white"
            )}
          >
            Create Account
          </button>
        </div>

        {/* Notification / Error / Success Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Demo Mode Notice if Supabase not configured */}
        {!isSupabaseAvailable && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-semibold block">Offline Preview Mode Active</span>
              <span className="text-neutral-300 text-[11px]">
                Supabase credentials are not yet configured in <code className="text-amber-200">.env.local</code>. Click below to explore as a demo viewer.
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. logan_roy"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Logan Roy"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{isSignUp ? "Create My Account" : "Sign In to AfterCredits"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Track Button */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={signInDemoUser}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Access (@demo_viewer)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
