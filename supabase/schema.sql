-- Startup Login — Supabase schema
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
--
-- IMPORTANT: before running, replace YOUR-ADMIN-EMAIL@example.com below with
-- the email address you will use to sign in to the review console.
-- Afterwards create that user in Authentication → Users → "Add user"
-- (set a password, tick "Auto confirm user"), and turn OFF public signups in
-- Authentication → Sign In / Up → Email → disable "Allow new users to sign up".

create table if not exists public.listings (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique,
  name        text not null,
  type        text not null default 'startup' check (type in ('startup', 'vc')),
  tagline     text not null default '',
  description text not null default '',
  website     text not null default '',
  city        text not null default '',
  state       text not null default '',
  sector      text not null default '',
  industry    text not null default '',
  stage       text not null default '',
  founded     text not null default '',
  founders    text not null default '',
  investors   text not null default '',
  funding     text not null default '',
  lat         double precision,
  lng         double precision,
  status      text not null default 'pending' check (status in ('pending', 'live', 'rejected')),
  created_at  timestamptz not null default now()
);

-- Submitter contact details live in a separate table that the public can
-- never read — only the signed-in admin.
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete cascade,
  email      text not null default '',
  linkedin   text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_city_idx   on public.listings (city);

alter table public.listings enable row level security;
alter table public.contacts enable row level security;


-- Safe to re-run: drop existing policies first, then recreate.
drop policy if exists "public read live listings"    on public.listings;
drop policy if exists "public submit pending listing" on public.listings;
drop policy if exists "admin full access listings"   on public.listings;
drop policy if exists "public submit contact"        on public.contacts;
drop policy if exists "admin read contacts"          on public.contacts;
drop policy if exists "admin delete contacts"        on public.contacts;

-- Anyone may read LIVE listings only.
create policy "public read live listings"
  on public.listings for select
  to anon, authenticated
  using (status = 'live');

-- Anyone may submit a new listing, but only as PENDING.
create policy "public submit pending listing"
  on public.listings for insert
  to anon, authenticated
  with check (status = 'pending');

-- Anyone may attach contact details to a submission (write-only for public).
create policy "public submit contact"
  on public.contacts for insert
  to anon, authenticated
  with check (true);

-- The admin (your email) has full access.
create policy "admin full access listings"
  on public.listings for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'YOUR-ADMIN-EMAIL@example.com')
  with check ((auth.jwt() ->> 'email') = 'YOUR-ADMIN-EMAIL@example.com');

create policy "admin read contacts"
  on public.contacts for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'YOUR-ADMIN-EMAIL@example.com');

create policy "admin delete contacts"
  on public.contacts for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'YOUR-ADMIN-EMAIL@example.com');
