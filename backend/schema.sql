-- Flag Check — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) before starting the backend.
-- Replaces the old LowDB (backend/db.json) file-based store with real, constrained tables.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- players
-- One row per device. No auth — deviceId is a random UUID minted client-side
-- and stored in localStorage, same trust model as before, now with a real
-- primary key and a unique constraint instead of a JSON object key.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists players (
  id                uuid primary key default gen_random_uuid(),
  device_id         text unique not null,
  username          text not null,
  gender            text not null check (gender in ('male', 'female')),
  current_streak    integer not null default 0,
  longest_streak    integer not null default 0,
  last_played_date  date,
  puzzle_state      jsonb not null default '{}'::jsonb, -- { [date]: { startedAt: epochMs } } — anchors the 90s timer server-side
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- skills
-- Loose thematic grouping for puzzles (communication, boundaries, control,
-- trust, respect, accountability, support, ...). Optional for gameplay,
-- useful for an eventual "practice a specific skill" mode or admin filtering.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists skills (
  id            uuid primary key default gen_random_uuid(),
  name          text unique not null,
  description   text
);

-- ─────────────────────────────────────────────────────────────────────────
-- puzzles
-- IMPORTANT: the correct answer is defined ONCE per puzzle, not per gender.
-- `target_person` says whose behavior is being judged ("boy" | "girl" — these
-- are just the two chat-bubble roles, not the player's own gender). `verdict`
-- is the single correct answer for that person. Every player answers the
-- same question about the same person and is checked against the same
-- verdict, regardless of which gender they registered with.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists puzzles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,          -- stable id used by the app, e.g. "p01"
  skill_id      uuid references skills(id),
  title         text not null,
  difficulty    text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  messages      jsonb not null,                -- [{ s: "boy"|"girl", t: "..." }, ...]
  target_person text not null check (target_person in ('boy', 'girl')),
  verdict       text not null check (verdict in ('red', 'green')),
  explanation   text not null,
  status        text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- daily_puzzles
-- Which puzzle every player sees on a given calendar date. Picked
-- deterministically and persisted the first time it's requested, so the
-- assignment never changes mid-day even if the puzzle bank changes.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists daily_puzzles (
  date        date primary key,
  puzzle_id   uuid not null references puzzles(id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- attempts
-- One row per (player, puzzle). The UNIQUE constraint is the actual
-- database-level guarantee that a player can't submit twice for the same
-- puzzle — no more relying on an app-level `lastPlayedDate` check.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists attempts (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references players(id) on delete cascade,
  puzzle_id   uuid not null references puzzles(id) on delete cascade,
  answer      text not null check (answer in ('red', 'green')),
  correct     boolean not null,
  played_at   timestamptz not null default now(),
  unique (player_id, puzzle_id)
);

create index if not exists idx_attempts_player_played_at on attempts (player_id, played_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- The backend talks to Supabase with the service_role key (server-side only,
-- never shipped to the client), which bypasses RLS. RLS is enabled here so
-- that if the anon/public key is ever exposed on the frontend, it can't read
-- or write these tables directly.
-- ─────────────────────────────────────────────────────────────────────────
alter table players enable row level security;
alter table skills enable row level security;
alter table puzzles enable row level security;
alter table daily_puzzles enable row level security;
alter table attempts enable row level security;

-- seed skills
insert into skills (name, description) values
  ('communication', 'Saying what you need clearly instead of expecting it to be guessed'),
  ('boundaries', 'Setting and respecting limits without guilt or pressure'),
  ('control', 'Recognizing surveillance, jealousy, and control disguised as care'),
  ('trust', 'Building or eroding trust through honesty and follow-through'),
  ('respect', 'How disagreement, criticism, and feedback are handled'),
  ('accountability', 'Owning mistakes versus deflecting or minimizing them'),
  ('support', 'Showing up for a partner during hard moments')
on conflict (name) do nothing;
