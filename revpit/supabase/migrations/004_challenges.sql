-- Challenges (competitive timed events)
create table if not exists public.challenges (
  id               uuid default gen_random_uuid() primary key,
  title            text not null,
  description      text,
  type             text not null default 'photo',   -- photo | track | build | drift | style
  points           integer not null default 0,
  prize            text,
  banner_url       text,
  starts_at        timestamptz not null default now(),
  ends_at          timestamptz not null,
  is_featured      boolean default false,
  entry_count      integer default 0,
  winner_id        uuid references public.profiles(id),
  created_at       timestamptz default now()
);

-- Challenge entries
create table if not exists public.challenge_entries (
  id             uuid default gen_random_uuid() primary key,
  challenge_id   uuid references public.challenges(id) on delete cascade,
  user_id        uuid references public.profiles(id) on delete cascade,
  media_url      text,
  caption        text,
  vote_count     integer default 0,
  created_at     timestamptz default now(),
  unique(challenge_id, user_id)
);

-- Entry votes
create table if not exists public.challenge_votes (
  id         uuid default gen_random_uuid() primary key,
  entry_id   uuid references public.challenge_entries(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(entry_id, user_id)
);

-- Backfill any columns that may be missing from an earlier partial run
alter table public.challenges add column if not exists type        text        not null default 'photo';
alter table public.challenges add column if not exists points      integer     not null default 0;
alter table public.challenges add column if not exists prize       text;
alter table public.challenges add column if not exists banner_url  text;
alter table public.challenges add column if not exists starts_at   timestamptz not null default now();
alter table public.challenges add column if not exists ends_at     timestamptz not null default now();
alter table public.challenges add column if not exists is_featured boolean     default false;
alter table public.challenges add column if not exists entry_count integer     default 0;
alter table public.challenges add column if not exists winner_id   uuid        references public.profiles(id);
alter table public.challenges add column if not exists created_at  timestamptz default now();

alter table public.challenge_entries add column if not exists media_url   text;
alter table public.challenge_entries add column if not exists caption     text;
alter table public.challenge_entries add column if not exists vote_count  integer default 0;
alter table public.challenge_entries add column if not exists created_at  timestamptz default now();

-- RLS
alter table public.challenges         enable row level security;
alter table public.challenge_entries  enable row level security;
alter table public.challenge_votes    enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'challenges'        and policyname = 'Public challenges')   then create policy "Public challenges"   on public.challenges        for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'challenge_entries' and policyname = 'Public entries')       then create policy "Public entries"      on public.challenge_entries for select using (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'challenge_entries' and policyname = 'Own entries')          then create policy "Own entries"          on public.challenge_entries for insert with check (true); end if;
  if not exists (select 1 from pg_policies where tablename = 'challenge_votes'   and policyname = 'Own challenge votes')  then create policy "Own challenge votes"  on public.challenge_votes   for all   using (true); end if;
end $$;

-- Seed challenges (skip if already seeded)
insert into public.challenges (title, description, type, points, prize, ends_at, is_featured, entry_count)
select * from (values
  (
    'STANCE WARS S1',
    'Show us your best fitment. Low, flush, and clean — drop your stance shots and let the community vote.',
    'photo',
    2500,
    '2,500 REV POINTS + Featured Profile Badge',
    now() + interval '14 days',
    true,
    0
  ),
  (
    'FASTEST LAP — TRACK DAY LEADERBOARD',
    'Submit your best lap time from any track day this season. Verified by photo or in-car footage.',
    'track',
    5000,
    '5,000 REV POINTS + Track Day Hero Badge',
    now() + interval '30 days',
    false,
    0
  ),
  (
    'BUILD OF THE MONTH — MARCH',
    'Best overall build this month. Engine, exterior, interior — judges score on originality and execution.',
    'build',
    10000,
    '10,000 REV POINTS + Build King Badge',
    now() + interval '21 days',
    false,
    0
  ),
  (
    'DRIFT KING — WINTER ROUND',
    'Show your drift entry, angle, and smoke. Best clip as voted by the community takes the crown.',
    'drift',
    3000,
    '3,000 REV POINTS + Smoke Machine Badge',
    now() + interval '7 days',
    false,
    0
  )
) as v(title, description, type, points, prize, ends_at, is_featured, entry_count)
where not exists (select 1 from public.challenges limit 1);
