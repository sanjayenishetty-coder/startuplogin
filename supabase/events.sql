-- Events section: timing column + the 10 curated marquee events.
-- Run once in the SQL Editor (after incubators.sql). Safe to re-run.

alter table public.listings add column if not exists timing text not null default '';

insert into public.listings
  (slug, name, type, tagline, description, website, city, state, sector, industry, stage, founded, founders, investors, funding, lat, lng, timing, status)
values
('startup-mahakumbh', 'Startup Mahakumbh', 'event', 'India''s largest startup gathering at Bharat Mandapam — founders, investors and policymakers under one roof.', '', 'https://www.startupmahakumbh.org', 'Delhi', 'Delhi NCR', 'Conference', '', '', '', '', '', '', null, null, 'Annual · Mar–Apr', 'live'),
('techsparks', 'TechSparks (YourStory)', 'event', 'YourStory''s flagship startup-tech summit, running for over a decade.', '', 'https://yourstory.com/techsparks', 'Bengaluru', 'Karnataka', 'Conference', '', '', '', '', '', '', null, null, 'Annual · Sep–Oct', 'live'),
('bengaluru-tech-summit', 'Bengaluru Tech Summit', 'event', 'Karnataka government''s flagship technology event — India''s largest tech summit.', '', 'https://www.bengalurutechsummit.com', 'Bengaluru', 'Karnataka', 'Summit', '', '', '', '', '', '', null, null, 'Annual · Nov', 'live'),
('global-fintech-fest', 'Global Fintech Fest', 'event', 'The world''s largest fintech conference, hosted in Mumbai.', '', 'https://www.globalfintechfest.com', 'Mumbai', 'Maharashtra', 'Conference', '', '', '', '', '', '', null, null, 'Annual · Oct', 'live'),
('tie-global-summit', 'TiE Global Summit', 'event', 'TiE''s flagship global entrepreneurship summit.', '', 'https://www.tieglobalsummit.org', 'Hyderabad', 'Telangana', 'Summit', '', '', '', '', '', '', null, null, 'Annual · Dec', 'live'),
('nasscom-ntlf', 'nasscom Technology & Leadership Forum', 'event', 'India''s premier technology industry forum by nasscom.', '', 'https://www.nasscom.in', 'Mumbai', 'Maharashtra', 'Conference', '', '', '', '', '', '', null, null, 'Annual · Feb', 'live'),
('india-mobile-congress', 'India Mobile Congress', 'event', 'Asia''s largest digital technology forum, backed by the DoT and COAI.', '', 'https://www.indiamobilecongress.com', 'Delhi', 'Delhi NCR', 'Conference', '', '', '', '', '', '', null, null, 'Annual · Oct', 'live'),
('saasboomi-annual', 'SaaSBoomi Annual', 'event', 'The largest gathering of India''s SaaS founders and operators.', '', 'https://saasboomi.com', 'Chennai', 'Tamil Nadu', 'Conference', '', '', '', '', '', '', null, null, 'Annual · Feb–Mar', 'live'),
('esummit-iit-bombay', 'E-Summit, IIT Bombay', 'event', 'Asia''s largest student-run entrepreneurship summit, by E-Cell IIT Bombay.', '', 'https://www.ecell.in', 'Mumbai', 'Maharashtra', 'Summit', '', '', '', '', '', '', null, null, 'Annual · Jan–Feb', 'live'),
('headstart-startup-saturday', 'Headstart Startup Saturday', 'event', 'India''s longest-running volunteer-led startup meetup, first Saturday of every month.', '', 'https://headstart.in', '', '', 'Meetup', '', '', '', '', '', '', null, null, 'Monthly · 20+ cities', 'live')
on conflict (slug) do nothing;
