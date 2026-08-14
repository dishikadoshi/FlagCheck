-- Migration 002: player identity moves from device_id -> username
--
-- Run this in the Supabase SQL editor if you already applied the original
-- schema.sql. It's safe to run even on an empty `players` table.
--
-- Why: the app now supports multiple players sharing one browser/device
-- (e.g. a couple both playing on the same phone). A player's row is now
-- looked up by their username (case-insensitively), not by a device id.

alter table players drop constraint if exists players_device_id_key;
alter table players alter column device_id drop not null;

alter table players add column if not exists username_key text
  generated always as (lower(trim(username))) stored;

create unique index if not exists players_username_key_idx on players (username_key);

-- If you already have rows with duplicate usernames from testing (differing
-- only by device_id), the unique index creation above will fail with a
-- conflict. In that case, first decide which row per username to keep, e.g.:
--
--   delete from players a using players b
--   where a.username_key = b.username_key and a.id > b.id;
--
-- then re-run the CREATE UNIQUE INDEX statement above.
