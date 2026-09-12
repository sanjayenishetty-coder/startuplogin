-- Batch: 85 incubators/accelerators + 90 startups from imported sheets (deduped, Sep 2026).
-- Run once in the SQL Editor. Safe to re-run: inserts skip existing slugs.

insert into public.listings
  (slug, name, type, tagline, description, website, city, state, sector, industry, stage, founded, founders, investors, funding, lat, lng, timing, status)
values
('stage', 'STAGE', 'startup', 'OTT platform for Bharat — original shows in Haryanvi, Rajasthani and other dialects.', '', 'https://stage.in', 'Indore', 'Madhya Pradesh', 'Media & Adtech', 'OTT / Dialect Content', 'Series B', '2019', '', '', '', 22.74163, 75.82954, '', 'live'),
('shopkirana', 'ShopKirana', 'startup', 'B2B commerce platform supplying kirana stores with tech, logistics and scale.', '', 'https://shopkirana.com', 'Indore', 'Madhya Pradesh', 'E-commerce', 'B2B Commerce / Retail Supply', 'Series C+', '2015', '', '', '', 22.7563, 75.87919, '', 'live'),
('classmonitor', 'ClassMonitor', 'startup', 'Early-learning kits and app guiding parents through home-based education.', '', 'https://classmonitor.com', 'Indore', 'Madhya Pradesh', 'Edtech', 'Early Learning / Homeschooling', 'Seed', '2016', '', '', '', 22.67948, 75.86383, '', 'live'),
('tractorgyan', 'TractorGyan', 'startup', 'Marketplace and information platform for buying, selling and comparing tractors.', '', 'https://tractorgyan.com', 'Indore', 'Madhya Pradesh', 'Agritech', 'Tractor Marketplace', '', '2016', '', '', '', 22.73047, 75.89803, '', 'live'),
('gramophone', 'Gramophone', 'startup', 'Full-stack agritech platform for inputs, advisory and market linkage (acquired by Unnati).', '', 'https://gramophone.in', 'Indore', 'Madhya Pradesh', 'Agritech', 'Farm Inputs / Advisory', 'Acquired', '2016', '', '', '', 22.67696, 75.84426, '', 'live'),
('engineerbabu', 'EngineerBabu', 'startup', 'App and web development partner for startups and enterprises.', '', 'https://engineerbabu.com', 'Indore', 'Madhya Pradesh', 'IT Services', 'Software Development', 'Bootstrapped', '2014', '', '', '', 22.71656, 75.84641, '', 'live'),
('walkover', 'Walkover', 'startup', 'Bootstrapped SaaS house behind MSG91, Giddh and other business products.', '', 'https://walkover.in', 'Indore', 'Madhya Pradesh', 'SaaS', 'Communication APIs / SaaS', 'Bootstrapped', '2010', '', '', '', 22.67794, 75.86088, '', 'live'),
('systango', 'Systango', 'startup', 'NSE-listed digital engineering firm — data, AI and cloud services.', '', 'https://www.systango.com', 'Indore', 'Madhya Pradesh', 'IT Services', 'Data & AI Engineering', 'Public', '2007', '', '', '', 22.75915, 75.88999, '', 'live'),
('anaxee-digital-runners', 'Anaxee Digital Runners', 'startup', '40,000-strong ''digital runner'' network taking enterprise work to rural India, incl. carbon dMRV.', '', 'https://anaxee.com', 'Indore', 'Madhya Pradesh', 'Others', 'Rural Reach / Enterprise Tech', 'Seed', '2016', '', '', '', 22.66983, 75.85921, '', 'live'),
('wiraa', 'Wiraa', 'startup', 'Global remote-jobs and freelance work platform.', '', 'https://wiraa.com', 'Indore', 'Madhya Pradesh', 'HRtech', 'Remote Jobs Platform', '', '', '', '', '', 22.67116, 75.81683, '', 'live'),
('deqode', 'Deqode', 'startup', 'Software consultancy building blockchain, web and app products.', '', 'https://deqode.com', 'Indore', 'Madhya Pradesh', 'IT Services', 'Blockchain / Software', '', '', '', '', '', 22.74731, 75.86624, '', 'live')
on conflict (slug) do nothing;
