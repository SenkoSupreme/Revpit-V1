-- Pits (topic communities, like subreddits)
create table public.pits (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  display_name text not null,
  description text,
  banner_url text,
  icon_url text,
  created_by uuid references public.profiles(id),
  member_count integer default 0,
  is_official boolean default false,
  created_at timestamptz default now()
);

-- Pit Members
create table public.pit_members (
  id uuid default gen_random_uuid() primary key,
  pit_id uuid references public.pits(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default now(),
  unique(pit_id, user_id)
);

-- Drops (posts)
create table public.drops (
  id uuid default gen_random_uuid() primary key,
  pit_id uuid references public.pits(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text default 'text',
  media_urls text[],
  poll_options jsonb,
  tag text,
  rev_count integer default 0,
  idle_count integer default 0,
  reply_count integer default 0,
  score integer default 0,
  is_pinned boolean default false,
  is_locked boolean default false,
  created_at timestamptz default now()
);

-- Votes
create table public.drop_votes (
  id uuid default gen_random_uuid() primary key,
  drop_id uuid references public.drops(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  vote text not null,
  created_at timestamptz default now(),
  unique(drop_id, user_id)
);

-- Replies (threaded comments)
create table public.replies (
  id uuid default gen_random_uuid() primary key,
  drop_id uuid references public.drops(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  parent_reply_id uuid references public.replies(id),
  body text not null,
  rev_count integer default 0,
  created_at timestamptz default now()
);

-- Trophies (awards)
create table public.trophies (
  id uuid default gen_random_uuid() primary key,
  drop_id uuid references public.drops(id) on delete cascade,
  given_by uuid references public.profiles(id),
  trophy_type text not null,
  created_at timestamptz default now()
);

-- RLS
alter table public.pits enable row level security;
alter table public.pit_members enable row level security;
alter table public.drops enable row level security;
alter table public.drop_votes enable row level security;
alter table public.replies enable row level security;
alter table public.trophies enable row level security;

create policy "Public pits" on public.pits for select using (true);
create policy "Public drops" on public.drops for select using (true);
create policy "Public replies" on public.replies for select using (true);
create policy "Public trophies" on public.trophies for select using (true);
create policy "Own drops" on public.drops for insert with check (auth.uid() = author_id);
create policy "Own replies" on public.replies for insert with check (auth.uid() = author_id);
create policy "Own votes" on public.drop_votes for all using (auth.uid() = user_id);
create policy "Join pits" on public.pit_members for insert with check (auth.uid() = user_id);

-- Seed default Pits
insert into public.pits (name, display_name, description, is_official) values
  ('general', 'Pit: General', 'The main community — all things automotive', true),
  ('builds', 'Pit: Builds', 'Show off your build progress and mods', true),
  ('stance', 'Pit: Stance', 'Low and slow — fitment, camber, and stance culture', true),
  ('track', 'Pit: Track Day', 'Circuit life, lap times, and track prep', true),
  ('jdm', 'Pit: JDM', 'Japanese domestic market builds and culture', true),
  ('euro', 'Pit: Euro', 'European marques — BMW, Porsche, Merc, Audi, VAG', true),
  ('american', 'Pit: American', 'Muscle, American iron, and V8 culture', true),
  ('tech', 'Pit: Tech Talk', 'Tuning, diagnostics, ECU, engine builds', true),
  ('events', 'Pit: Events', 'Meets, shows, track days — find events near you', true),
  ('memes', 'Pit: Rev Memes', 'Car memes and entertainment — keep it fun', true);

-- Profiles extension
alter table public.profiles add column if not exists community_score integer default 0;
