-- Incubators & accelerators + investor city fixes.
-- Run once in the SQL Editor AFTER investor_tags.sql. Safe to re-run.

-- Gurugram is now in the investor city list — restore the two NCR funds
update public.listings set city = 'Gurugram'
  where slug in ('elevation-capital', 'titan-capital');

-- Seed the incubators & accelerators section
insert into public.listings
  (slug, name, type, tagline, description, website, city, state, sector, industry, stage, founded, founders, investors, funding, lat, lng, status)
values
('t-hub', 'T-Hub', 'incubator', 'India''s largest innovation hub, backed by the Telangana government — 2,000+ startups supported.', '', 'https://t-hub.co', 'Hyderabad', 'Telangana', 'Incubator', '', '', '2015', '', '', '', 17.40751, 78.47225, 'live'),
('we-hub', 'WE Hub', 'incubator', 'India''s first state-led incubator exclusively for women entrepreneurs.', '', 'https://wehub.telangana.gov.in', 'Hyderabad', 'Telangana', 'Incubator', '', '', '2018', '', '', '', 17.41735, 78.4535, 'live'),
('nsrcel', 'NSRCEL (IIM Bangalore)', 'incubator', 'IIM Bangalore''s startup hub incubating ventures from idea to scale across sectors.', '', 'https://www.nsrcel.org', 'Bengaluru', 'Karnataka', 'Incubator', '', '', '2002', '', '', '', 12.97006, 77.60548, 'live'),
('c-camp', 'C-CAMP', 'incubator', 'National platform for deep-science and biotech startups — discovery to deployment.', '', 'https://www.ccamp.res.in', 'Bengaluru', 'Karnataka', 'Incubator', '', '', '2009', '', '', '', 12.96665, 77.57969, 'live'),
('axilor-ventures', 'Axilor Ventures', 'incubator', 'Accelerator and early-stage fund co-founded by Infosys co-founders Kris Gopalakrishnan and S.D. Shibulal.', '', 'https://axilor.com', 'Bengaluru', 'Karnataka', 'Accelerator', '', '', '2014', '', '', '', 12.92652, 77.6281, 'live'),
('ciie-co', 'CIIE.CO (IIM Ahmedabad)', 'incubator', 'IIM Ahmedabad''s innovation continuum — incubation, acceleration and seed investing.', '', 'https://ciie.co', 'Ahmedabad', 'Gujarat', 'Incubator', '', '', '2002', '', '', '', 23.03445, 72.60957, 'live'),
('icreate', 'iCreate', 'incubator', 'Independent centre for tech startup incubation in EVs, energy and deeptech.', '', 'https://www.icreate.org.in', 'Ahmedabad', 'Gujarat', 'Incubator', '', '', '2012', '', '', '', 23.02629, 72.59714, 'live'),
('sine-iit-bombay', 'SINE, IIT Bombay', 'incubator', 'IIT Bombay''s technology business incubator for science and engineering ventures.', '', 'https://www.sineiitb.org', 'Mumbai', 'Maharashtra', 'Incubator', '', '', '2004', '', '', '', 19.0788, 72.87358, 'live'),
('villgro', 'Villgro', 'incubator', 'One of the world''s oldest social-enterprise incubators — health, climate and agriculture.', '', 'https://villgro.org', 'Chennai', 'Tamil Nadu', 'Incubator', '', '', '2001', '', '', '', 13.07072, 80.24879, 'live'),
('iitm-incubation-cell', 'IIT Madras Incubation Cell', 'incubator', 'Deep-tech incubator behind 300+ startups including Ather Energy and Agnikul.', '', 'https://www.incubation.iitm.ac.in', 'Chennai', 'Tamil Nadu', 'Incubator', '', '', '2013', '', '', '', 13.08827, 80.31417, 'live'),
('gsf-accelerator', 'GSF Accelerator', 'incubator', 'Early accelerator for Indian tech startups with a national mentor network.', '', 'https://www.gsfaccelerator.com', 'Delhi', 'Delhi NCR', 'Accelerator', '', '', '2012', '', '', '', 28.60351, 77.19913, 'live'),
('startup-oasis', 'Startup Oasis', 'incubator', 'Rajasthan''s leading incubator, an initiative of RIICO and CIIE.CO.', '', 'https://www.startupoasis.in', 'Jaipur', 'Rajasthan', 'Incubator', '', '', '2013', '', '', '', 26.94106, 75.77108, 'live')
on conflict (slug) do nothing;
