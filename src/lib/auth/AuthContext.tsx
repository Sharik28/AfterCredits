"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { signInAction, signUpAction, signOutAction } from "./actions";

export interface UserSession {
  id: string;
  email?: string;
  username: string;
  displayName: string;
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  isDemoUser: boolean;
  isSupabaseAvailable: boolean;
  authModalOpen: boolean;
  authModalMode: "signin" | "signup";
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = "aftercredits_demo_user_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  const isSupabaseAvailable = isSupabaseConfigured();

  // Initialize session
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (isSupabaseAvailable) {
        const supabase = createClient();
        if (supabase) {
          const { data: { user: sbUser } } = await supabase.auth.getUser();
          if (mounted && sbUser) {
            setUser({
              id: sbUser.id,
              email: sbUser.email,
              username: (sbUser.user_metadata?.username as string) || "user",
              displayName: (sbUser.user_metadata?.display_name as string) || "TV Fan",
            });
            setIsDemoUser(false);
            setIsLoading(false);
            return;
          }

          // Listen for auth changes
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
              if (session?.user) {
                setUser({
                  id: session.user.id,
                  email: session.user.email,
                  username: (session.user.user_metadata?.username as string) || "user",
                  displayName: (session.user.user_metadata?.display_name as string) || "TV Fan",
                });
                setIsDemoUser(false);
              } else {
                // If demo user exists, fallback
                const storedDemo = localStorage.getItem(DEMO_USER_KEY);
                if (storedDemo) {
                  setUser(JSON.parse(storedDemo));
                  setIsDemoUser(true);
                } else {
                  setUser(null);
                  setIsDemoUser(false);
                }
              }
              setIsLoading(false);
            }
          );

          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      }

      // Check stored demo session for offline/demo environment
      try {
        const storedDemo = localStorage.getItem(DEMO_USER_KEY);
        if (storedDemo && mounted) {
          setUser(JSON.parse(storedDemo));
          setIsDemoUser(true);
        }
      } catch {
        // Storage not accessible
      }

      if (mounted) {
        setIsLoading(false);
      }
    }

    initSession();

    return () => {
      mounted = false;
    };
  }, [isSupabaseAvailable]);

  const openAuthModal = useCallback((mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseAvailable) {
      return {
        success: false,
        error: "Supabase cloud credentials are not configured in .env.local. Click 'Explore as Demo User' to try the app offline.",
      };
    }

    const res = await signInAction({ email, password });
    if (res.success && res.user) {
      setUser({
        id: res.user.id,
        email: res.user.email,
        username: res.user.username || "user",
        displayName: res.user.displayName || res.user.username || "TV Fan",
      });
      setIsDemoUser(false);
      localStorage.removeItem(DEMO_USER_KEY);
      closeAuthModal();
      return { success: true };
    }
    return { success: false, error: res.error || "Failed to sign in." };
  }, [isSupabaseAvailable, closeAuthModal]);

  const signUp = useCallback(
    async (email: string, password: string, username: string, displayName: string) => {
      if (!isSupabaseAvailable) {
        return {
          success: false,
          error: "Supabase cloud credentials are not configured in .env.local. Click 'Explore as Demo User' to try the app offline.",
        };
      }

      const res = await signUpAction({ email, password, username, displayName });
      if (res.success && res.user) {
        setUser({
          id: res.user.id,
          email: res.user.email,
          username: res.user.username || username,
          displayName: res.user.displayName || displayName || username,
        });
        setIsDemoUser(false);
        localStorage.removeItem(DEMO_USER_KEY);
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: res.error || "Failed to create account." };
    },
    [isSupabaseAvailable, closeAuthModal]
  );

  const signOut = useCallback(async () => {
    if (isSupabaseAvailable) {
      await signOutAction();
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
    setIsDemoUser(false);
  }, [isSupabaseAvailable]);

  const signInDemoUser = useCallback(() => {
    const demoUser: UserSession = {
      id: "demo_user_42",
      email: "demo@aftercredits.tv",
      username: "demo_viewer",
      displayName: "Demo Viewer",
    };
    try {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    } catch {
      // Storage issue
    }
    setUser(demoUser);
    setIsDemoUser(true);
    closeAuthModal();
  }, [closeAuthModal]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoUser,
        isSupabaseAvailable,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        signInDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
