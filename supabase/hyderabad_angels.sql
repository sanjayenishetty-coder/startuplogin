-- Batch: 85 incubators/accelerators + 90 startups from imported sheets (deduped, Sep 2026).
-- Run once in the SQL Editor. Safe to re-run: inserts skip existing slugs.

insert into public.listings
  (slug, name, type, tagline, description, website, city, state, sector, industry, stage, founded, founders, investors, funding, lat, lng, timing, status)
values
('marwari-angels', 'Marwari Angels', 'vc', 'Angel network blending traditional Marwari business networks with early-stage tech investing.', '', 'https://themarwariangels.com', 'Hyderabad', 'Telangana', 'Angel Networks / Funds', '', '', '2018', '', '', '', 17.37953, 78.51743, '', 'live'),
('tie-hyderabad', 'TiE Hyderabad', 'vc', 'TiE chapter whose member angels invest in early-stage startups alongside mentorship programs.', '', 'https://hyderabad.tie.org', 'Hyderabad', 'Telangana', 'Angel Networks / Funds', '', '', '1999', '', '', '', 17.39474, 78.52059, '', 'live')
on conflict (slug) do nothing;

-- Correct SucSEED Indovation's website and category.
update public.listings set website = 'https://sucseed-indovation.com',
  sector = 'Angel Networks / Funds' where slug = 'sucseed-indovation';
