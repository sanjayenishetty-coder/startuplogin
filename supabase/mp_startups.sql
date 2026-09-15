-- Batch: 85 incubators/accelerators + 90 startups from imported sheets (deduped, Sep 2026).
-- Run once in the SQL Editor. Safe to re-run: inserts skip existing slugs.

insert into public.listings
  (slug, name, type, tagline, description, website, city, state, sector, industry, stage, founded, founders, investors, funding, lat, lng, timing, status)
values
('agrigator', 'AgriGator', 'startup', 'AgriTech / Grain Logistics SaaS.', '', 'https://agrigator.co', 'Bhopal', 'Madhya Pradesh', 'Agritech', 'AgriTech / Grain Logistics SaaS', 'Seed', '2019', '', '', '', 23.22124, 77.41589, '', 'live'),
('collegekhabri', 'CollegeKhabri', 'startup', 'EdTech / Higher Ed Discovery.', '', 'https://collegekhabri.com', 'Bhopal', 'Madhya Pradesh', 'Edtech', 'EdTech / Higher Ed Discovery', 'Pre-seed', '2017', '', '', '', 23.27596, 77.40056, '', 'live'),
('medyseva', 'MedySeva', 'startup', 'HealthTech / Telemedicine.', '', 'https://medyseva.com', 'Bhopal', 'Madhya Pradesh', 'Healthtech', 'HealthTech / Telemedicine', 'Seed', '2021', '', '', '', 23.26897, 77.43776, '', 'live'),
('the-kabadiwala', 'The Kabadiwala', 'startup', 'CleanTech / Recycling Tech.', '', 'https://thekabadiwala.com', 'Bhopal', 'Madhya Pradesh', 'Cleantech', 'CleanTech / Recycling Tech', 'Seed', '2013', '', '', '', 23.26291, 77.41878, '', 'live'),
('arivihan', 'Arivihan', 'startup', 'EdTech / AI Learning.', '', 'https://arivihan.com', 'Indore', 'Madhya Pradesh', 'Edtech', 'EdTech / AI Learning', 'Seed', '2021', '', '', '', 22.741, 75.83423, '', 'live'),
('pataa-navigations', 'Pataa Navigations', 'startup', 'GeoTech / Digital Addressing.', '', 'https://pataa.com', 'Indore', 'Madhya Pradesh', 'Deeptech', 'GeoTech / Digital Addressing', 'Series A', '2020', '', '', '', 22.74593, 75.83041, '', 'live'),
('swaaha', 'Swaaha', 'startup', 'CleanTech / Waste Management.', '', 'https://swaaha.in', 'Indore', 'Madhya Pradesh', 'Cleantech', 'CleanTech / Waste Management', 'Seed', '2016', '', '', '', 22.67355, 75.8482, '', 'live'),
('neevcloud', 'NeevCloud', 'startup', 'AI Infrastructure / Cloud SaaS.', '', 'https://neevcloud.com', 'Indore', 'Madhya Pradesh', 'AI', 'AI Infrastructure / Cloud SaaS', 'Seed', '2023', '', '', '', 22.7049, 75.87218, '', 'live'),
('genietalk-ai', 'GenieTalk.ai', 'startup', 'Conversational AI / Voice Automation.', '', 'https://genietalk.ai', 'Indore', 'Madhya Pradesh', 'AI', 'Conversational AI / Voice Automation', 'Seed', '2019', '', '', '', 22.76023, 75.87089, '', 'live'),
('robro-systems', 'Robro Systems', 'startup', 'Industrial AI / Computer Vision.', '', 'https://robrosystems.com', 'Indore', 'Madhya Pradesh', 'AI', 'Industrial AI / Computer Vision', 'Seed', '2020', '', '', '', 22.74225, 75.90244, '', 'live'),
('we360-ai', 'We360.ai', 'startup', 'Workforce Analytics / SaaS.', '', 'https://we360.ai', 'Bhopal', 'Madhya Pradesh', 'HRtech', 'Workforce Analytics / SaaS', 'Seed', '2021', '', '', '', 23.22224, 77.41095, '', 'live'),
('pabbly', 'Pabbly', 'startup', 'Subscription Billing & Automation SaaS.', '', 'https://pabbly.com', 'Bhopal', 'Madhya Pradesh', 'SaaS', 'Subscription Billing & Automation SaaS', 'Bootstrapped', '2018', '', '', '', 23.24051, 77.41937, '', 'live')
on conflict (slug) do nothing;
