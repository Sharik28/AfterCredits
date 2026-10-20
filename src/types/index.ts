// =============================================================================
// AfterCredits Type Definitions
// =============================================================================

export type WatchStatus =
  | 'want_to_watch'
  | 'watching'
  | 'completed'
  | 'on_hold'
  | 'dropped';

export interface Genre {
  id: number;
  name: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string | null;
  episode_count: number;
  episodes?: Episode[];
}

export interface TVShow {
  id: number; // TMDB ID
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date?: string;
  status: string; // "Returning Series", "Ended", etc.
  number_of_seasons: number;
  number_of_episodes: number;
  vote_average: number;
  vote_count?: number;
  genres: Genre[];
  networks?: Network[];
  tagline?: string;
  seasons?: Season[];
  in_production?: boolean;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  show_id: number;
  show?: TVShow;
  status: WatchStatus;
  current_season: number;
  current_episode: number;
  created_at: string;
  updated_at: string;
}

export interface ShowRating {
  id: string;
  user_id: string;
  show_id: number;
  rating: number; // 0.5 to 5.0
  created_at: string;
}

export interface SeasonRating {
  id: string;
  user_id: string;
  show_id: number;
  season_id: number;
  season_number: number;
  rating: number; // 0.5 to 5.0
  personal_rank?: number;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_profile?: UserProfile;
  show_id: number;
  show_name?: string;
  show_poster?: string | null;
  season_id?: number | null;
  season_number?: number | null;
  rating?: number | null;
  content: string;
  has_spoilers: boolean;
  spoilers_up_to_season?: number | null;
  spoilers_up_to_episode?: number | null;
  likes_count: number;
  is_liked_by_me?: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string | null;
  header_backdrop_url?: string | null;
  favorite_shows?: number[]; // TMDB Show IDs
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  user_profile: UserProfile;
  activity_type:
    | 'rating'
    | 'season_rating'
    | 'review'
    | 'watchlist_add'
    | 'watchlist_status'
    | 'list_created'
    | 'follow';
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CustomList {
  id: string;
  user_id: string;
  user_profile?: UserProfile;
  title: string;
  description: string;
  is_ranked: boolean;
  is_private: boolean;
  item_count: number;
  items?: CustomListItem[];
  created_at: string;
  updated_at: string;
}

export interface CustomListItem {
  id: string;
  list_id: string;
  show_id: number;
  show: TVShow;
  season_id?: number | null;
  season_number?: number | null;
  position: number;
  notes?: string;
}
