-- Adds the startup name to the notify list. Run once in the SQL Editor.
-- Safe to re-run, and safe on a table that already holds signups: existing
-- rows get an empty string rather than null, so nothing has to be cleaned up.

alter table public.notify_signups
  add column if not exists startup_name text not null default '';
