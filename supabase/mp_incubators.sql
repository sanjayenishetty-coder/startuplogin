-- Batch: 85 incubators/accelerators + 90 startups from imported sheets (deduped, Sep 2026).
-- Run once in the SQL Editor. Safe to re-run: inserts skip existing slugs.

insert into public.listings
  (slug, name, type, tagline, description, website, city, state, sector, industry, stage, founded, founders, investors, funding, lat, lng, timing, status)
values
('aic-iifm', 'AIC-IIFM', 'incubator', 'Incubator — Forestry & Climate Tech.', '', 'https://iifm.ac.in', 'Bhopal', 'Madhya Pradesh', 'Incubator', 'Forestry & Climate Tech', '', '2020', '', '', '', 23.27939, 77.39374, '', 'live'),
('b-nest-incubator', 'B-Nest Incubator', 'incubator', 'Govt / Smart City Incubator — Bhopal Smart City Corp.', '', 'https://smartbhopal.city', 'Bhopal', 'Madhya Pradesh', 'Incubator', 'Bhopal Smart City Corp', '', '2018', '', '', '', 23.21025, 77.42779, '', 'live'),
('iice-iiser-bhopal', 'IICE - IISER Bhopal', 'incubator', 'Academic / DST NIDHI-TBI — DeepTech & Bioscience.', '', 'https://iice.iiserb.ac.in', 'Bhopal', 'Madhya Pradesh', 'Incubator', 'DeepTech & Bioscience', '', '2019', '', '', '', 23.24369, 77.43509, '', 'live'),
('klic-lnct-group', 'KLIC - LNCT Group', 'incubator', 'Academic Incubator — Tech Startups & Seed Fund.', '', 'https://lnct.ac.in', 'Bhopal', 'Madhya Pradesh', 'Incubator', 'Tech Startups & Seed Fund', '', '2017', '', '', '', 23.27852, 77.44751, '', 'live'),
('manit-rolta-incubation-centre', 'MANIT Rolta Incubation Centre', 'incubator', 'Academic / NIDHI-TBI — Engineering & IT Hardware.', '', 'https://manit.ac.in', 'Bhopal', 'Madhya Pradesh', 'Incubator', 'Engineering & IT Hardware', '', '2016', '', '', '', 23.22862, 77.46032, '', 'live'),
('aic-prestige', 'AIC-Prestige', 'incubator', 'Atal Incubation Centre — Sector Agnostic.', '', 'https://aicprestige.org', 'Indore', 'Madhya Pradesh', 'Incubator', 'Sector Agnostic', '', '2018', '', '', '', 22.7215, 75.85492, '', 'live'),
('iit-indore-disi-disiti', 'IIT Indore DISI / DISITI', 'incubator', 'Academic Incubator — IIT Indore / DeepTech.', '', 'https://disi.iiti.ac.in', 'Indore', 'Madhya Pradesh', 'Incubator', 'IIT Indore / DeepTech', '', '2019', '', '', '', 22.75927, 75.81489, '', 'live'),
('sgsits-i-tbi', 'SGSITS i-TBI', 'incubator', 'DST-NIDHI i-TBI — Engineering & Tech Innovation.', '', 'https://sgsits.ac.in', 'Indore', 'Madhya Pradesh', 'Incubator', 'Engineering & Tech Innovation', '', '2021', '', '', '', 22.6976, 75.80848, '', 'live')
on conflict (slug) do nothing;
