"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email?: string;
    username?: string;
    displayName?: string;
  } | null;
}

// Server-side validation helpers
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,24}$/.test(username);
}

/**
 * Sign Up with email, password, and profile metadata
 */
export async function signUpAction(data: {
  email: string;
  password: string;
  username: string;
  displayName: string;
}): Promise<AuthResponse> {
  const { email, password, username, displayName } = data;

  // 1. Validation
  if (!email || !validateEmail(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }
  if (!username || !validateUsername(username)) {
    return {
      success: false,
      error: "Username must be 3-24 characters long and use only letters, numbers, or underscores.",
    };
  }

  // 2. Supabase Integration
  const supabase = await createClient();
  if (!supabase) {
    return {
      success: false,
      error: "Supabase credentials are not configured in .env.local. You can use Demo Mode to explore the application offline.",
    };
  }

  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: username.trim().toLowerCase(),
          display_name: displayName.trim() || username.trim(),
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: authData.user
        ? {
            id: authData.user.id,
            email: authData.user.email,
            username: username.trim().toLowerCase(),
            displayName: displayName.trim() || username.trim(),
          }
        : null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred during signup.";
    return { success: false, error: message };
  }
}

/**
 * Sign In with email and password
 */
export async function signInAction(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { email, password } = data;

  if (!email || !validateEmail(email)) {
    return { success: false, error: "Please provide a valid email address." };
  }
  if (!password) {
    return { success: false, error: "Please enter your password." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      success: false,
      error: "Supabase credentials are not configured in .env.local. You can use Demo Mode to explore the application offline.",
    };
  }

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = authData.user;
    return {
      success: true,
      user: user
        ? {
            id: user.id,
            email: user.email,
            username: (user.user_metadata?.username as string) || "user",
            displayName: (user.user_metadata?.display_name as string) || "TV Fan",
          }
        : null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred during sign-in.";
    return { success: false, error: message };
  }
}

/**
 * Sign Out
 */
export async function signOutAction(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to sign out.";
    return { success: false, error: message };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUserAction(): Promise<AuthResponse> {
  const supabase = await createClient();
  if (!supabase) {
    return { success: true, user: null };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { success: true, user: null };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: (user.user_metadata?.username as string) || `user_${user.id.slice(0, 8)}`,
        displayName: (user.user_metadata?.display_name as string) || "TV Fan",
      },
    };
  } catch {
    return { success: true, user: null };
  }
}
