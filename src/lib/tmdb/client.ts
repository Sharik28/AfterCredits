import { TVShow, Season } from "@/types";
import { MOCK_SHOWS } from "./mockData";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function getApiKey(): string | null {
  return process.env.TMDB_API_KEY || null;
}

function getReadToken(): string | null {
  return process.env.TMDB_READ_ACCESS_TOKEN || null;
}

export function isTMDBConfigured(): boolean {
  return Boolean(getApiKey() || getReadToken());
}

async function tmdbFetch<T>(endpoint: string, searchParams?: Record<string, string>): Promise<T | null> {
  const apiKey = getApiKey();
  const token = getReadToken();

  if (!apiKey && !token) {
    return null;
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  }
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 }, // Cache TMDB responses for 1 hour
    });
    if (!res.ok) {
      console.warn(`[TMDB API Error] ${res.status}: ${res.statusText} on ${endpoint}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[TMDB Network Error]`, err);
    return null;
  }
}

/**
 * Get popular/trending TV shows
 */
export async function getTrendingShows(): Promise<TVShow[]> {
  const live = await tmdbFetch<{ results: TVShow[] }>("/trending/tv/week");
  if (live && live.results && live.results.length > 0) {
    return live.results;
  }
  return MOCK_SHOWS;
}

/**
 * Search TV shows by query string
 */
export async function searchShows(query: string): Promise<TVShow[]> {
  if (!query || query.trim() === "") {
    return getTrendingShows();
  }

  const live = await tmdbFetch<{ results: TVShow[] }>("/search/tv", {
    query: query.trim(),
    include_adult: "false",
  });

  if (live && live.results && live.results.length > 0) {
    return live.results;
  }

  // Fallback: search in mock database
  const q = query.toLowerCase();
  const matches = MOCK_SHOWS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.overview && s.overview.toLowerCase().includes(q)) ||
      (s.genres && s.genres.some((g) => g.name.toLowerCase().includes(q)))
  );

  return matches.length > 0 ? matches : MOCK_SHOWS.slice(0, 4);
}

/**
 * Get detailed TV show metadata by ID
 */
export async function getShowDetails(id: number): Promise<TVShow | null> {
  const live = await tmdbFetch<TVShow>(`/tv/${id}`, {
    append_to_response: "credits,videos",
  });

  if (live && live.id) {
    return live;
  }

  // Fallback to mock show
  const mock = MOCK_SHOWS.find((s) => s.id === id);
  if (mock) {
    return mock;
  }

  // If not found in mock list, generate a graceful placeholder show
  return {
    id,
    name: "Show #" + id,
    overview: "Detailed show information is unavailable offline. Configure your TMDB API Key in .env.local for full catalog access.",
    poster_path: null,
    backdrop_path: null,
    first_air_date: "2024-01-01",
    status: "Unknown",
    number_of_seasons: 1,
    number_of_episodes: 10,
    vote_average: 7.5,
    genres: [{ id: 18, name: "Drama" }],
    seasons: [
      {
        id: id * 10 + 1,
        season_number: 1,
        name: "Season 1",
        overview: "Season 1 overview",
        poster_path: null,
        air_date: "2024-01-01",
        episode_count: 10,
      },
    ],
  };
}

/**
 * Get specific season metadata with episodes
 */
export async function getShowSeason(showId: number, seasonNumber: number): Promise<Season | null> {
  const live = await tmdbFetch<Season>(`/tv/${showId}/season/${seasonNumber}`);
  if (live && live.season_number !== undefined) {
    return live;
  }

  const show = MOCK_SHOWS.find((s) => s.id === showId);
  const season = show?.seasons?.find((s) => s.season_number === seasonNumber);
  return season || null;
}
