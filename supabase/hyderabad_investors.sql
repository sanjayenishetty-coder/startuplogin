-- Batch: 85 incubators/accelerators + 90 startups from imported sheets (deduped, Sep 2026).
-- Run once in the SQL Editor. Safe to re-run: inserts skip existing slugs.

insert into public.listings
  (slug, name, type, tagline, description, website, city, state, sector, industry, stage, founded, founders, investors, funding, lat, lng, timing, status)
values
('endiya-partners', 'Endiya Partners', 'vc', 'Early-stage deeptech, health and enterprise VC — Darwinbox, SigTuple and Qapita among 45+ portfolio companies.', '', 'https://www.endiya.com', 'Hyderabad', 'Telangana', 'VC Funds', '', '', '2015', '', '', '', 17.37069, 78.49123, '', 'live'),
('anthill-ventures', 'Anthill Ventures', 'vc', 'Speed-scaling investment platform for urban tech, health and media startups.', '', 'https://anthillventures.com', 'Hyderabad', 'Telangana', 'VC Funds', '', '', '2015', '', '', '', 17.38692, 78.5127, '', 'live'),
('ventureast', 'Ventureast', 'vc', 'One of India''s longest-running VC funds — life sciences, tech and financial inclusion.', '', 'https://ventureast.net', 'Hyderabad', 'Telangana', 'VC Funds', '', '', '1997', '', '', '', 17.3699, 78.50254, '', 'live'),
('sucseed-indovation', 'SucSEED Indovation', 'vc', 'SEBI-registered early-stage fund backing deep-tech and product startups across India.', '', 'https://sucseed.com', 'Hyderabad', 'Telangana', 'Micro PE / VC', '', '', '2016', '', '', '', 17.38133, 78.53116, '', 'live'),
('pavestone-vc', 'Pavestone VC', 'vc', 'Growth-stage B2B technology fund — enterprise tech, cloud and frontier tech.', '', 'https://pavestone.vc', 'Hyderabad', 'Telangana', 'VC Funds', '', '', '2021', '', '', '', 17.38077, 78.52025, '', 'live')
on conflict (slug) do nothing;
