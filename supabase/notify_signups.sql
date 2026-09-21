-- "Notify me" signups for sections that are not live yet (Startup Schemes).
-- Run once in the SQL Editor. Safe to re-run.
--
-- The public may INSERT but never SELECT: the address list cannot be read
-- back from the browser with the anon key. Only the admin account can read
-- or delete it.

create table if not exists public.notify_signups (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text not null default 'schemes',
  created_at timestamptz not null default now()
);

-- One signup per address per section; a repeat insert fails with 23505,
-- which the site treats as "you're already on the list".
create unique index if not exists notify_signups_email_source_idx
  on public.notify_signups (lower(email), source);

alter table public.notify_signups enable row level security;

drop policy if exists "public may join the notify list" on public.notify_signups;
drop policy if exists "admin reads notify list"         on public.notify_signups;
drop policy if exists "admin deletes notify list"       on public.notify_signups;

-- Anyone may add themselves.
create policy "public may join the notify list"
  on public.notify_signups for insert
  to anon, authenticated
  with check (email <> '');

-- Only the admin can read the addresses.
create policy "admin reads notify list"
  on public.notify_signups for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'support@startuplogin.com');

create policy "admin deletes notify list"
  on public.notify_signups for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'support@startuplogin.com');
