-- DEFACUP initial schema
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text not null unique,
  season_label text not null default '',
  status text not null default 'draft' check (status in ('draft','group','knockout','completed')),
  visibility text not null default 'unlisted' check (visibility in ('private','unlisted','public')),
  logo_url text,
  template_id text not null default 'wc32',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  short_code text not null,
  crest_color text not null default '#14a85c',
  crest_url text,
  fair_play int not null default 0,
  pot int
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  sort_order int not null default 0
);

create table if not exists public.group_teams (
  group_id uuid not null references public.groups(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  primary key (group_id, team_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  stage text not null check (stage in ('group','r16','qf','sf','third','final')),
  group_id uuid references public.groups(id) on delete set null,
  home_team_id uuid references public.teams(id) on delete set null,
  away_team_id uuid references public.teams(id) on delete set null,
  home_score int,
  away_score int,
  home_penalties int,
  away_penalties int,
  status text not null default 'scheduled' check (status in ('scheduled','live','finished')),
  match_day int,
  kickoff_at timestamptz,
  venue text,
  bracket_position int,
  label text
);

create table if not exists public.bracket_slots (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round text not null,
  position int not null,
  side text not null check (side in ('home','away')),
  source_type text not null,
  source_ref jsonb not null default '{}'::jsonb
);

create index if not exists idx_tournaments_owner on public.tournaments(owner_id);
create index if not exists idx_tournaments_slug on public.tournaments(slug);
create index if not exists idx_teams_tournament on public.teams(tournament_id);
create index if not exists idx_matches_tournament on public.matches(tournament_id);
create index if not exists idx_groups_tournament on public.groups(tournament_id);

alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.teams enable row level security;
alter table public.groups enable row level security;
alter table public.group_teams enable row level security;
alter table public.matches enable row level security;
alter table public.bracket_slots enable row level security;

create or replace function public.is_tournament_owner(tid uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.tournaments t
    where t.id = tid and t.owner_id = auth.uid()
  );
$$;

create or replace function public.can_read_tournament(tid uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.tournaments t
    where t.id = tid and (
      t.owner_id = auth.uid()
      or t.visibility in ('public', 'unlisted')
    )
  );
$$;

-- Profiles
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);

-- Tournaments
create policy "tournaments_select" on public.tournaments for select using (
  owner_id = auth.uid() or visibility in ('public', 'unlisted')
);
create policy "tournaments_insert" on public.tournaments for insert with check (auth.uid() = owner_id);
create policy "tournaments_update" on public.tournaments for update using (auth.uid() = owner_id);
create policy "tournaments_delete" on public.tournaments for delete using (auth.uid() = owner_id);

-- Child tables
create policy "teams_select" on public.teams for select using (public.can_read_tournament(tournament_id));
create policy "teams_mutate" on public.teams for all using (public.is_tournament_owner(tournament_id));

create policy "groups_select" on public.groups for select using (public.can_read_tournament(tournament_id));
create policy "groups_mutate" on public.groups for all using (public.is_tournament_owner(tournament_id));

create policy "group_teams_select" on public.group_teams for select using (
  exists (select 1 from public.groups g where g.id = group_id and public.can_read_tournament(g.tournament_id))
);
create policy "group_teams_mutate" on public.group_teams for all using (
  exists (select 1 from public.groups g where g.id = group_id and public.is_tournament_owner(g.tournament_id))
);

create policy "matches_select" on public.matches for select using (public.can_read_tournament(tournament_id));
create policy "matches_mutate" on public.matches for all using (public.is_tournament_owner(tournament_id));

create policy "bracket_select" on public.bracket_slots for select using (public.can_read_tournament(tournament_id));
create policy "bracket_mutate" on public.bracket_slots for all using (public.is_tournament_owner(tournament_id));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Realtime
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.tournaments;
