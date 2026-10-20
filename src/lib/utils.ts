import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTMDBImageUrl(
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string {
  if (!path) {
    return "/images/placeholder-poster.png";
  }
  if (path.startsWith("http")) {
    return path;
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function formatAirYear(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).getFullYear().toString();
  } catch {
    return "";
  }
}

export function formatRating(rating?: number | null): string {
  if (rating === null || rating === undefined || rating === 0) return "—";
  return rating.toFixed(1);
}

export function formatStatusLabel(status: string): string {
  switch (status) {
    case "want_to_watch":
      return "Want to Watch";
    case "watching":
      return "Watching";
    case "completed":
      return "Completed";
    case "on_hold":
      return "On Hold";
    case "dropped":
      return "Dropped";
    default:
      return status;
  }
}
