-- Re-key the admin policies to the real admin account.
-- Run once in the SQL Editor. Safe to re-run.
-- If you sign in to /admin with a different email, change it below first.

drop policy if exists "admin full access listings" on public.listings;
drop policy if exists "admin read contacts"        on public.contacts;
drop policy if exists "admin delete contacts"      on public.contacts;

create policy "admin full access listings"
  on public.listings for all
  to authenticated
  using ((auth.jwt() ->> 'email') = 'support@startuplogin.com')
  with check ((auth.jwt() ->> 'email') = 'support@startuplogin.com');

create policy "admin read contacts"
  on public.contacts for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'support@startuplogin.com');

create policy "admin delete contacts"
  on public.contacts for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'support@startuplogin.com');
