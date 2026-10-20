-- =============================================================================
-- AfterCredits Database Schema & Security Policies
-- Target: PostgreSQL 15+ (Supabase)
-- =============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------
create type watch_status as enum (
  'want_to_watch',
  'watching',
  'completed',
  'on_hold',
  'dropped'
);

create type activity_type as enum (
  'rating',
  'season_rating',
  'review',
  'watchlist_add',
  'watchlist_status',
  'list_created',
  'follow'
);

-- -----------------------------------------------------------------------------
-- 2. PROFILES
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text default '',
  avatar_url text,
  header_backdrop_url text,
  favorite_shows jsonb default '[]'::jsonb,
  is_private boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint username_format check (username ~* '^[a-zA-Z0-9_]{3,24}$')
);

-- -----------------------------------------------------------------------------
-- 3. SHOWS (Cached TMDB metadata)
-- -----------------------------------------------------------------------------
create table if not exists public.shows (
  id bigint primary key, -- TMDB show ID
  name text not null,
  original_name text,
  overview text,
  poster_path text,
  backdrop_path text,
  first_air_date date,
  last_air_date date,
  status text,
  number_of_seasons integer default 1,
  number_of_episodes integer default 0,
  vote_average numeric(3,1) default 0.0,
  genres jsonb default '[]'::jsonb,
  networks jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------------------------------
-- 4. SEASONS (Cached TMDB season metadata)
-- -----------------------------------------------------------------------------
create table if not exists public.seasons (
  id bigint primary key, -- TMDB season ID
  show_id bigint not null references public.shows(id) on delete cascade,
  season_number integer not null,
  name text not null,
  overview text,
  poster_path text,
  air_date date,
  episode_count integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint uq_show_season unique (show_id, season_number)
);

-- -----------------------------------------------------------------------------
-- 5. WATCHLIST & STATUS TRACKING
-- -----------------------------------------------------------------------------
create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  show_id bigint not null references public.shows(id) on delete cascade,
  status watch_status not null default 'want_to_watch',
  current_season integer default 1,
  current_episode integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint uq_user_show_watchlist unique (user_id, show_id)
);

-- -----------------------------------------------------------------------------
-- 6. SHOW RATINGS
-- -----------------------------------------------------------------------------
create table if not exists public.show_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  show_id bigint not null references public.shows(id) on delete cascade,
  rating numeric(2,1) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint rating_range check (rating >= 0.5 and rating <= 5.0),
  constraint uq_user_show_rating unique (user_id, show_id)
);

-- -----------------------------------------------------------------------------
-- 7. SEASON RATINGS & PERSONAL RANKINGS
-- -----------------------------------------------------------------------------
create table if not exists public.season_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  show_id bigint not null references public.shows(id) on delete cascade,
  season_id bigint not null references public.seasons(id) on delete cascade,
  season_number integer not null,
  rating numeric(2,1) not null,
  personal_rank integer,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint season_rating_range check (rating >= 0.5 and rating <= 5.0),
  constraint uq_user_season_rating unique (user_id, season_id)
);

-- -----------------------------------------------------------------------------
-- 8. REVIEWS & SPOILER CONTROLS
-- -----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  show_id bigint not null references public.shows(id) on delete cascade,
  season_id bigint references public.seasons(id) on delete set null,
  rating numeric(2,1),
  content text not null,
  has_spoilers boolean not null default false,
  spoilers_up_to_season integer,
  spoilers_up_to_episode integer,
  likes_count integer default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint review_rating_range check (rating is null or (rating >= 0.5 and rating <= 5.0))
);

-- -----------------------------------------------------------------------------
-- 9. REVIEW LIKES
-- -----------------------------------------------------------------------------
create table if not exists public.review_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  review_id uuid not null references public.reviews(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (user_id, review_id)
);

-- -----------------------------------------------------------------------------
-- 10. FOLLOWS (Social Graph)
-- -----------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id),
  constraint cannot_follow_self check (follower_id <> following_id)
);

-- -----------------------------------------------------------------------------
-- 11. LISTS & LIST ITEMS
-- -----------------------------------------------------------------------------
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  is_ranked boolean default false,
  is_private boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  show_id bigint not null references public.shows(id) on delete cascade,
  season_id bigint references public.seasons(id) on delete set null,
  position integer not null default 0,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint uq_list_show_season unique (list_id, show_id, season_id)
);

-- -----------------------------------------------------------------------------
-- 12. DIARY & ACTIVITY LOGS
-- -----------------------------------------------------------------------------
create table if not exists public.show_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  show_id bigint not null references public.shows(id) on delete cascade,
  season_number integer,
  episode_number integer,
  watched_on date not null default current_date,
  rating numeric(2,1),
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type activity_type not null,
  target_id text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- -----------------------------------------------------------------------------
-- 13. INDEXES FOR PERFORMANCE
-- -----------------------------------------------------------------------------
create index if not exists idx_watchlist_user on public.watchlist_items(user_id);
create index if not exists idx_watchlist_status on public.watchlist_items(status);
create index if not exists idx_reviews_show on public.reviews(show_id);
create index if not exists idx_reviews_user on public.reviews(user_id);
create index if not exists idx_reviews_has_spoilers on public.reviews(has_spoilers);
create index if not exists idx_season_ratings_show on public.season_ratings(show_id);
create index if not exists idx_season_ratings_season on public.season_ratings(season_id);
create index if not exists idx_activities_user_created on public.activities(user_id, created_at desc);
create index if not exists idx_follows_following on public.follows(following_id);
create index if not exists idx_follows_follower on public.follows(follower_id);

-- -----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.shows enable row level security;
alter table public.seasons enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.show_ratings enable row level security;
alter table public.season_ratings enable row level security;
alter table public.reviews enable row level security;
alter table public.review_likes enable row level security;
alter table public.follows enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.show_logs enable row level security;
alter table public.activities enable row level security;

-- Profiles: Public read, user can update only their own
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Shows & Seasons: Public read, insert/update by authenticated users caching shows
create policy "Shows are viewable by everyone" on public.shows
  for select using (true);

create policy "Authenticated users can insert shows" on public.shows
  for insert with check (auth.role() = 'authenticated');

create policy "Seasons are viewable by everyone" on public.seasons
  for select using (true);

create policy "Authenticated users can insert seasons" on public.seasons
  for insert with check (auth.role() = 'authenticated');

-- Watchlist: Public read, write by owner
create policy "Watchlist items viewable by everyone" on public.watchlist_items
  for select using (true);

create policy "Users can manage their own watchlist" on public.watchlist_items
  for all using (auth.uid() = user_id);

-- Ratings: Public read, write by owner
create policy "Ratings viewable by everyone" on public.show_ratings
  for select using (true);

create policy "Users can manage their own show ratings" on public.show_ratings
  for all using (auth.uid() = user_id);

create policy "Season ratings viewable by everyone" on public.season_ratings
  for select using (true);

create policy "Users can manage their own season ratings" on public.season_ratings
  for all using (auth.uid() = user_id);

-- Reviews: Public read, write by author
create policy "Reviews viewable by everyone" on public.reviews
  for select using (true);

create policy "Users can manage their own reviews" on public.reviews
  for all using (auth.uid() = user_id);

-- Follows: Public read, write by follower
create policy "Follows viewable by everyone" on public.follows
  for select using (true);

create policy "Users can manage their follows" on public.follows
  for all using (auth.uid() = follower_id);

-- Lists: Public read unless private, write by owner
create policy "Public lists viewable by everyone" on public.lists
  for select using (not is_private or auth.uid() = user_id);

create policy "Users can manage their own lists" on public.lists
  for all using (auth.uid() = user_id);

create policy "List items viewable by everyone" on public.list_items
  for select using (true);

create policy "Users can manage their list items" on public.list_items
  for all using (
    auth.uid() in (select user_id from public.lists where id = list_items.list_id)
  );

-- Diary logs: Viewable by user or public if allowed
create policy "Users can manage their own diary logs" on public.show_logs
  for all using (auth.uid() = user_id);

create policy "Diary logs viewable by everyone" on public.show_logs
  for select using (true);

-- Activities: Public read, insert by authenticated
create policy "Activities viewable by everyone" on public.activities
  for select using (true);

create policy "Users can insert their own activities" on public.activities
  for insert with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 15. PROFILE TRIGGER ON NEW AUTH SIGNUP
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'TV Fan'),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
