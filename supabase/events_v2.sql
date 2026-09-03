-- Events section v2: 66 popular event properties (deduped, Aug 2026).
-- Run once in the SQL Editor. Safe to re-run: inserts skip existing slugs,
-- updates only fill blank founding years.

insert into public.listings
  (slug, name, type, tagline, description, website, city, state, sector, industry, stage, founded, founders, investors, funding, lat, lng, timing, status)
values
('startup-mahakumbh', 'Startup Mahakumbh', 'event', 'India''s largest startup gathering at Bharat Mandapam — founders, investors and policymakers under one roof.', '', 'https://www.startupmahakumbh.org', 'Delhi', 'Delhi NCR', 'Conference', '', '', '2024', '', '', '', null, null, 'Annual · Mar–Apr', 'live'),
('techsparks', 'TechSparks (YourStory)', 'event', 'YourStory''s flagship startup-tech summit, running for over a decade.', '', 'https://yourstory.com/techsparks', 'Bengaluru', 'Karnataka', 'Conference', '', '', '2010', '', '', '', null, null, 'Annual · Sep–Oct', 'live'),
('bengaluru-tech-summit', 'Bengaluru Tech Summit', 'event', 'Karnataka government''s flagship technology event — India''s largest tech summit.', '', 'https://www.bengalurutechsummit.com', 'Bengaluru', 'Karnataka', 'Summit', '', '', '1998', '', '', '', null, null, 'Annual · Nov', 'live'),
('global-fintech-fest', 'Global Fintech Fest', 'event', 'The world''s largest fintech conference, hosted in Mumbai.', '', 'https://www.globalfintechfest.com', 'Mumbai', 'Maharashtra', 'Conference', '', '', '2020', '', '', '', null, null, 'Annual · Oct', 'live'),
('tie-global-summit', 'TiE Global Summit', 'event', 'TiE''s flagship global entrepreneurship summit.', '', 'https://www.tieglobalsummit.org', 'Hyderabad', 'Telangana', 'Summit', '', '', '1992', '', '', '', null, null, 'Annual · Dec', 'live'),
('nasscom-ntlf', 'nasscom Technology & Leadership Forum', 'event', 'India''s premier technology industry forum by nasscom.', '', 'https://www.nasscom.in', 'Mumbai', 'Maharashtra', 'Conference', '', '', '1993', '', '', '', null, null, 'Annual · Feb', 'live'),
('india-mobile-congress', 'India Mobile Congress', 'event', 'Asia''s largest digital technology forum, backed by the DoT and COAI.', '', 'https://www.indiamobilecongress.com', 'Delhi', 'Delhi NCR', 'Conference', '', '', '2017', '', '', '', null, null, 'Annual · Oct', 'live'),
('saasboomi-annual', 'SaaSBoomi Annual', 'event', 'The largest gathering of India''s SaaS founders and operators.', '', 'https://saasboomi.com', 'Chennai', 'Tamil Nadu', 'Conference', '', '', '2018', '', '', '', null, null, 'Annual · Feb–Mar', 'live'),
('esummit-iit-bombay', 'E-Summit, IIT Bombay', 'event', 'Asia''s largest student-run entrepreneurship summit, by E-Cell IIT Bombay.', '', 'https://www.ecell.in', 'Mumbai', 'Maharashtra', 'Summit', '', '', '', '', '', '', null, null, 'Annual · Jan–Feb', 'live'),
('headstart-startup-saturday', 'Headstart Startup Saturday', 'event', 'India''s longest-running volunteer-led startup meetup, first Saturday of every month.', '', 'https://headstart.in', '', '', 'Meetup', '', '', '2007', '', '', '', null, null, 'Monthly · 20+ cities', 'live'),
('global-startup-summit', 'Global Startup Summit', 'event', 'Regional Summits — Founder-Investor Matchmaking.', '', 'https://globalstartups.club', 'Mumbai', 'Maharashtra', 'Summit', '', '', '2021', '', '', '', 19.10567, 72.85343, '', 'live'),
('21by72-startup-summit', '21BY72 Startup Summit', 'event', 'Regional Megashow — Tier-2/3 Startup Ecosystem.', '', 'https://21by72.com', 'Surat', 'Gujarat', 'Expo', '', '', '2022', '', '', '', 21.15611, 72.85062, '', 'live'),
('cypher-analytics-india-mag', 'Cypher (Analytics India Mag)', 'event', 'Specialized Conference — AI & Enterprise Analytics.', '', 'https://analyticsindiamag.com/cypher', 'Bengaluru', 'Karnataka', 'Conference', '', '', '2015', '', '', '', 12.97273, 77.585, '', 'live'),
('startup-hub-expo', 'Startup Hub Expo', 'event', 'Exhibition & Summit — B2B Startup Exhibition.', '', 'https://startuphubexpo.com', 'Delhi', 'Delhi NCR', 'Expo', '', '', '2017', '', '', '', 28.57648, 77.23183, '', 'live'),
('echai-startup-demo-days', 'eChai Startup Demo Days', 'event', 'Monthly Meetups — Grassroots Pitching & Community.', '', 'https://echai.ventures', 'Pan-India', 'India', 'Meetup', '', '', '2014', '', '', '', null, null, '', 'live'),
('inc42-the-summit', 'Inc42 The Summit', 'event', 'Flagship Summit — D2C, FinTech & VC Trends.', '', 'https://inc42.com', 'Delhi', 'Delhi NCR', 'Summit', '', '', '2014', '', '', '', 28.59301, 77.20527, '', 'live'),
('nasscom-product-conclave-npc', 'NASSCOM Product Conclave (NPC)', 'event', 'Enterprise Summit — B2B SaaS & Enterprise Software.', '', 'https://nasscom.in', 'Bengaluru', 'Karnataka', 'Summit', '', '', '2004', '', '', '', 13.00677, 77.54997, '', 'live'),
('tiecon-mumbai', 'TiEcon Mumbai', 'event', 'Regional Conclave — Enterprise, Capital & Leadership.', '', 'https://tieconmumbai.org', 'Mumbai', 'Maharashtra', 'Conference', '', '', '2009', '', '', '', 19.06557, 72.91158, '', 'live'),
('iot-india-congress', 'IoT India Congress', 'event', 'Industrial Tech Event — Hardware, IoT & Smart Infrastructure.', '', 'https://iotindiacongress.com', 'Bengaluru', 'Karnataka', 'Summit', '', '', '2016', '', '', '', 12.94754, 77.60966, '', 'live'),
('agritech-india-expo', 'AgriTech India Expo', 'event', 'B2B Exhibition — Smart Agriculture & Farm Mechanization.', '', 'https://agritechindia.com', 'Bengaluru', 'Karnataka', 'Expo', '', '', '2009', '', '', '', 12.96791, 77.60694, '', 'live'),
('cleantech-india-summit', 'CleanTech India Summit', 'event', 'Renewable Summit — EV, Storage & Sustainability.', '', 'https://cleantechsummit.in', 'Delhi', 'Delhi NCR', 'Summit', '', '', '2018', '', '', '', 28.64376, 77.19435, '', 'live'),
('tiecon-delhi-ncr', 'TiEcon Delhi-NCR', 'event', 'Regional Conference — Consumer Brands, Angel Tech & Growth.', '', 'https://tiecon-delhi.org', 'Delhi', 'Delhi NCR', 'Conference', '', '', '2007', '', '', '', 28.61873, 77.17265, '', 'live'),
('bioasia', 'BioAsia', 'event', 'Life Sciences Forum — Pharma, BioTech & MedTech.', '', 'https://bioasia.in', 'Hyderabad', 'Telangana', 'Conference', '', '', '2003', '', '', '', 17.42744, 78.41583, '', 'live'),
('india-smart-utility-week-isuw', 'India Smart Utility Week (ISUW)', 'event', 'Clean Energy Expo — Smart Grids, EV Infrastructure.', '', 'https://isuw.in', 'Delhi', 'Delhi NCR', 'Expo', '', '', '2015', '', '', '', 28.63165, 77.22671, '', 'live'),
('ai-days', 'AI Days', 'event', 'DeepTech Conference — Applied Machine Learning & LLMs.', '', 'https://aidays.io', 'Hyderabad', 'Telangana', 'Conference', '', '', '2023', '', '', '', 17.39388, 78.45697, '', 'live'),
('deftech-india-summit', 'DEFTECH India Summit', 'event', 'Industry Forum — DefenceTech & Space Enterprise.', '', 'https://deftech.in', 'Delhi', 'Delhi NCR', 'Conference', '', '', '2019', '', '', '', 28.6126, 77.20833, '', 'live'),
('future-of-saas-summit', 'Future of SaaS Summit', 'event', 'Specialized Summit — Global Expansion & PLG Strategies.', '', 'https://futureofsaas.com', 'Bengaluru', 'Karnataka', 'Summit', '', '', '2021', '', '', '', 12.96255, 77.61138, '', 'live'),
('india-internet-day-iday', 'India Internet Day (iDay)', 'event', 'Tech Leadership Conclave — Consumer Tech & Digital Economy.', '', 'https://internetday.in', 'Gurugram', 'Delhi NCR', 'Conference', '', '', '2012', '', '', '', 28.45197, 77.06936, '', 'live'),
('fintech-india-summit', 'Fintech India Summit', 'event', 'Industry Expo & Summit — Digital Banking & PayTech.', '', 'https://fintechindiasummit.com', 'Delhi', 'Delhi NCR', 'Expo', '', '', '2018', '', '', '', 28.62679, 77.23671, '', 'live'),
('d2c-summit-inc42', 'D2C Summit (Inc42)', 'event', 'Specialized Conclave — E-commerce Brands & Retail.', '', 'https://inc42.com/d2c-summit', 'Bengaluru', 'Karnataka', 'Conference', '', '', '2020', '', '', '', 12.95673, 77.56676, '', 'live'),
('aws-summit-india', 'AWS Summit India', 'event', 'Cloud Tech Summit — Cloud Infrastructure & Generative AI.', '', 'https://aws.amazon.com/events/summits/mumbai', 'Mumbai', 'Maharashtra', 'Summit', '', '', '2013', '', '', '', 19.08576, 72.87706, '', 'live'),
('google-for-india', 'Google for India', 'event', 'Annual Tech Showcase — Digital India, AI & Developer Tools.', '', 'https://blog.google/intl/en-in', 'Delhi', 'Delhi NCR', 'Expo', '', '', '2015', '', '', '', 28.63831, 77.17744, '', 'live'),
('nasscom-design-ai-summit', 'NASSCOM Design & AI Summit', 'event', 'Design & DeepTech Conclave — Product Design, UX & AI Architecture.', '', 'https://nasscom.in', 'Bengaluru', 'Karnataka', 'Conference', '', '', '2018', '', '', '', 12.97927, 77.60862, '', 'live'),
('ev-india-expo', 'EV India Expo', 'event', 'Trade Show & Summit — EV Fleet, Batteries & Infrastructure.', '', 'https://evindiaexpo.in', 'Greater Noida', 'Delhi NCR', 'Expo', '', '', '2019', '', '', '', 28.44956, 77.53839, '', 'live'),
('ieee-techsym', 'IEEE TechSym', 'event', 'Academic & Engineering Forum — Hardware, DeepTech & Telecom.', '', 'https://ieee.org', 'Pan-India', 'India', 'Conference', '', '', '2010', '', '', '', null, null, '', 'live'),
('tiecon-kolkata', 'TiEcon Kolkata', 'event', 'Regional Conclave — East India Entrepreneurship.', '', 'https://tieconkolkata.org', 'Kolkata', 'West Bengal', 'Conference', '', '', '2013', '', '', '', 22.55908, 88.35932, '', 'live'),
('tiecon-hyderabad', 'TiEcon Hyderabad', 'event', 'Regional Conclave — Pharma, SaaS & DeepTech Ecosystem.', '', 'https://tieconhyderabad.org', 'Hyderabad', 'Telangana', 'Conference', '', '', '2012', '', '', '', 17.45929, 78.44805, '', 'live'),
('bengaluru-tech-exchange', 'Bengaluru Tech Exchange', 'event', 'Regional Industry Forum — Startups & Govt Procurement.', '', 'https://bengaluru.gov.in', 'Bengaluru', 'Karnataka', 'Conference', '', '', '2022', '', '', '', 12.95037, 77.58096, '', 'live'),
('tiecon-chennai', 'TiEcon Chennai', 'event', 'Regional Conclave — SaaS Capital, Hardware & DeepTech.', '', 'https://tieconchennai.in', 'Chennai', 'Tamil Nadu', 'Conference', '', '', '2008', '', '', '', 13.04212, 80.27568, '', 'live'),
('nasscom-futureforge', 'NASSCOM FutureForge', 'event', 'DeepTech Summit — Frontier Tech & R&D.', '', 'https://nasscom.in', 'Bengaluru', 'Karnataka', 'Summit', '', '', '2022', '', '', '', 12.96111, 77.55071, '', 'live'),
('india-saas-devcon', 'India SaaS DevCon', 'event', 'Developer Conference — Building Global B2B SaaS.', '', 'https://saasdevcon.in', 'Bengaluru', 'Karnataka', 'Conference', '', '', '2021', '', '', '', 12.96848, 77.62849, '', 'live'),
('maker-faire-india', 'Maker Faire India', 'event', 'Hardware & Innovator Expo — Robotics, IoT & Open Hardware.', '', 'https://makerfaire.com', 'Pan-India', 'India', 'Expo', '', '', '2017', '', '', '', null, null, '', 'live'),
('agri-tech-india-conclave', 'Agri Tech India Conclave', 'event', 'Sector Summit — Farm Mechanization & Ag-Fintech.', '', 'https://agritechconclave.in', 'Delhi', 'Delhi NCR', 'Summit', '', '', '2016', '', '', '', 28.63609, 77.23216, '', 'live'),
('nasscom-enterprise-cloud-summit', 'NASSCOM Enterprise Cloud Summit', 'event', 'Enterprise Forum — Cloud Security & Enterprise Software.', '', 'https://nasscom.in', 'Mumbai', 'Maharashtra', 'Conference', '', '', '2019', '', '', '', 19.03184, 72.86173, '', 'live'),
('global-ai-summit-india', 'Global AI Summit India', 'event', 'National AI Conclave — MeitY / Enterprise AI Adoption.', '', 'https://indiaai.gov.in', 'Delhi', 'Delhi NCR', 'Conference', '', '', '2023', '', '', '', 28.619, 77.23449, '', 'live'),
('venture-capital-conclave-vccircle', 'Venture Capital Conclave (VCCircle)', 'event', 'Investor Summit — PE/VC Deals, Exits & Capital.', '', 'https://vccircle.com', 'Mumbai', 'Maharashtra', 'Summit', '', '', '2008', '', '', '', 19.03621, 72.86387, '', 'live'),
('healthtech-india-summit', 'HealthTech India Summit', 'event', 'Sector Expo — MedTech, Telemedicine & Bio.', '', 'https://healthtechindia.org', 'Delhi', 'Delhi NCR', 'Expo', '', '', '2017', '', '', '', 28.61643, 77.22619, '', 'live'),
('indian-gaming-show-igs', 'Indian Gaming Show (IGS)', 'event', 'Gaming & Tech Summit — Game Dev, Esports & GenAI.', '', 'https://gaming-show.in', 'Delhi', 'Delhi NCR', 'Summit', '', '', '2017', '', '', '', 28.64511, 77.21301, '', 'live'),
('india-space-congress-isc', 'India Space Congress (ISC)', 'event', 'Space Sector Conclave — SpaceTech, Satellites & Defence.', '', 'https://indiaspacecongress.com', 'Delhi', 'Delhi NCR', 'Conference', '', '', '2022', '', '', '', 28.61562, 77.22626, '', 'live'),
('plug-and-play-india-summit', 'Plug and Play India Summit', 'event', 'Corporate Innovation Summit — Startup-Enterprise Matchmaking.', '', 'https://plugandplaytechcenter.com', 'Gurugram', 'Delhi NCR', 'Summit', '', '', '2020', '', '', '', 28.4476, 77.01121, '', 'live'),
('cypher-ai-awards', 'CYPHER AI Awards', 'event', 'Annual Industry Awards — Data Science & AI Leadership.', '', 'https://analyticsindiamag.com', 'Bengaluru', 'Karnataka', 'Awards', '', '', '2017', '', '', '', 13.00257, 77.56222, '', 'live'),
('tiecon-chandigarh', 'TieCon Chandigarh', 'event', 'Regional Entrepreneur Conclave — Tier-2 Startup Ecosystem & Agri Tech.', '', 'https://tieconchandigarh.org', 'Chandigarh', 'Chandigarh', 'Conference', '', '', '2015', '', '', '', 30.68903, 76.81939, '', 'live'),
('open-source-india-osi', 'Open Source India (OSI)', 'event', 'Developer Conference — Open Source, Linux & AI Tech.', '', 'https://opensourceindia.in', 'Bengaluru', 'Karnataka', 'Conference', '', '', '2003', '', '', '', 12.92917, 77.58687, '', 'live'),
('google-i-o-extended-india', 'Google I/O Extended India', 'event', 'Developer Showcase — Android, Web, Cloud & GenAI.', '', 'https://io.google', 'Pan-India', 'India', 'Expo', '', '', '2014', '', '', '', null, null, '', 'live'),
('aws-community-day-india', 'AWS Community Day India', 'event', 'Cloud Developer Summit — AWS Infrastructure, Serverless & DevOps.', '', 'https://awsug.in', 'Pan-India', 'India', 'Summit', '', '', '2018', '', '', '', null, null, '', 'live'),
('pycon-india', 'PyCon India', 'event', 'Developer Conference — Python Programming, ML & Data Science.', '', 'https://in.pycon.org', 'Pan-India', 'India', 'Conference', '', '', '2009', '', '', '', null, null, '', 'live'),
('jsfoo-india', 'JSFoo India', 'event', 'Frontend Dev Summit — JavaScript, Web Performance & Frontend.', '', 'https://hasgeek.com/jsfoo', 'Bengaluru', 'Karnataka', 'Summit', '', '', '2011', '', '', '', 12.92718, 77.63153, '', 'live'),
('anthill-inside', 'Anthill Inside', 'event', 'AI / ML Conference — Deep Learning, Data Engineering & AI.', '', 'https://hasgeek.com/anthillinside', 'Bengaluru', 'Karnataka', 'Conference', '', '', '2017', '', '', '', 12.96668, 77.63518, '', 'live'),
('rootconf', 'Rootconf', 'event', 'DevOps Conference — SRE, Cloud Architecture & Cybersecurity.', '', 'https://hasgeek.com/rootconf', 'Bengaluru', 'Karnataka', 'Conference', '', '', '2011', '', '', '', 13.01657, 77.56318, '', 'live'),
('agile-india-summit', 'Agile India Summit', 'event', 'Software Engineering Conference — Agile, DevOps & Product Leadership.', '', 'https://agileindia.org', 'Bengaluru', 'Karnataka', 'Conference', '', '', '2005', '', '', '', 12.9977, 77.57941, '', 'live'),
('github-galaxy-india', 'GitHub Galaxy India', 'event', 'Developer Innovation Expo — AI Code Generation, Open Source & CI/CD.', '', 'https://githubgalaxy.com', 'Bengaluru', 'Karnataka', 'Expo', '', '', '2021', '', '', '', 12.9307, 77.62353, '', 'live'),
('bharat-mobility-global-expo', 'Bharat Mobility Global Expo', 'event', 'National Mobility Expo — Automotive, EV, Battery Tech & Hydrogen.', '', 'https://bharat-mobility.com', 'Delhi', 'Delhi NCR', 'Expo', '', '', '2024', '', '', '', 28.59745, 77.20525, '', 'live'),
('cyber-intelligence-asia-india', 'Cyber Intelligence Asia / India', 'event', 'Cybersecurity Conclave — InfoSec, Threat Intelligence & Cloud Safety.', '', 'https://cyberintelligenceasia.com', 'Delhi', 'Delhi NCR', 'Conference', '', '', '2015', '', '', '', 28.62032, 77.21066, '', 'live'),
('great-international-developer-summit-gids', 'Great International Developer Summit (GIDS)', 'event', 'Developer Megashow — Software Architecture, Cloud & AI.', '', 'https://developersummit.com', 'Bengaluru', 'Karnataka', 'Expo', '', '', '2008', '', '', '', 13.01175, 77.61107, '', 'live'),
('et-startup-awards-summit', 'ET Startup Awards Summit', 'event', 'National Awards & Summit — Unicorn Founders, Policy & VC Trends.', '', 'https://economictimes.indiatimes.com', 'Bengaluru', 'Karnataka', 'Awards', '', '', '2015', '', '', '', 12.94535, 77.569, '', 'live'),
('business-today-mindrush', 'Business Today Mindrush', 'event', 'Business & Leadership Summit — Economy, Enterprise Tech & CXOs.', '', 'https://businesstoday.in', 'Delhi', 'Delhi NCR', 'Summit', '', '', '2013', '', '', '', 28.6423, 77.22569, '', 'live')
on conflict (slug) do nothing;

-- enrich already-live events with founding years
update public.listings set founded = '2024' where slug = 'startup-mahakumbh' and founded = '';
update public.listings set founded = '2010' where slug = 'techsparks' and founded = '';
update public.listings set founded = '1998' where slug = 'bengaluru-tech-summit' and founded = '';
update public.listings set founded = '2020' where slug = 'global-fintech-fest' and founded = '';
update public.listings set founded = '1992' where slug = 'tie-global-summit' and founded = '';
update public.listings set founded = '1993' where slug = 'nasscom-ntlf' and founded = '';
update public.listings set founded = '2017' where slug = 'india-mobile-congress' and founded = '';
update public.listings set founded = '2018' where slug = 'saasboomi-annual' and founded = '';
update public.listings set founded = '2007' where slug = 'headstart-startup-saturday' and founded = '';
update public.listings set founded = '2021' where slug = 'global-startup-summit' and founded = '';
update public.listings set founded = '2022' where slug = '21by72-startup-summit' and founded = '';
update public.listings set founded = '2015' where slug = 'cypher-analytics-india-mag' and founded = '';
update public.listings set founded = '2017' where slug = 'startup-hub-expo' and founded = '';
update public.listings set founded = '2014' where slug = 'echai-startup-demo-days' and founded = '';
update public.listings set founded = '2014' where slug = 'inc42-the-summit' and founded = '';
update public.listings set founded = '2004' where slug = 'nasscom-product-conclave-npc' and founded = '';
update public.listings set founded = '2009' where slug = 'tiecon-mumbai' and founded = '';
update public.listings set founded = '2016' where slug = 'iot-india-congress' and founded = '';
update public.listings set founded = '2009' where slug = 'agritech-india-expo' and founded = '';
update public.listings set founded = '2018' where slug = 'cleantech-india-summit' and founded = '';
update public.listings set founded = '2007' where slug = 'tiecon-delhi-ncr' and founded = '';
update public.listings set founded = '2003' where slug = 'bioasia' and founded = '';
update public.listings set founded = '2015' where slug = 'india-smart-utility-week-isuw' and founded = '';
update public.listings set founded = '2023' where slug = 'ai-days' and founded = '';
update public.listings set founded = '2019' where slug = 'deftech-india-summit' and founded = '';
update public.listings set founded = '2021' where slug = 'future-of-saas-summit' and founded = '';
update public.listings set founded = '2012' where slug = 'india-internet-day-iday' and founded = '';
update public.listings set founded = '2018' where slug = 'fintech-india-summit' and founded = '';
update public.listings set founded = '2020' where slug = 'd2c-summit-inc42' and founded = '';
update public.listings set founded = '2013' where slug = 'aws-summit-india' and founded = '';
update public.listings set founded = '2015' where slug = 'google-for-india' and founded = '';
update public.listings set founded = '2018' where slug = 'nasscom-design-ai-summit' and founded = '';
update public.listings set founded = '2019' where slug = 'ev-india-expo' and founded = '';
update public.listings set founded = '2010' where slug = 'ieee-techsym' and founded = '';
update public.listings set founded = '2013' where slug = 'tiecon-kolkata' and founded = '';
update public.listings set founded = '2012' where slug = 'tiecon-hyderabad' and founded = '';
update public.listings set founded = '2022' where slug = 'bengaluru-tech-exchange' and founded = '';
update public.listings set founded = '2008' where slug = 'tiecon-chennai' and founded = '';
update public.listings set founded = '2022' where slug = 'nasscom-futureforge' and founded = '';
update public.listings set founded = '2021' where slug = 'india-saas-devcon' and founded = '';
update public.listings set founded = '2017' where slug = 'maker-faire-india' and founded = '';
update public.listings set founded = '2016' where slug = 'agri-tech-india-conclave' and founded = '';
update public.listings set founded = '2019' where slug = 'nasscom-enterprise-cloud-summit' and founded = '';
update public.listings set founded = '2023' where slug = 'global-ai-summit-india' and founded = '';
update public.listings set founded = '2008' where slug = 'venture-capital-conclave-vccircle' and founded = '';
update public.listings set founded = '2017' where slug = 'healthtech-india-summit' and founded = '';
update public.listings set founded = '2017' where slug = 'indian-gaming-show-igs' and founded = '';
update public.listings set founded = '2022' where slug = 'india-space-congress-isc' and founded = '';
update public.listings set founded = '2020' where slug = 'plug-and-play-india-summit' and founded = '';
update public.listings set founded = '2017' where slug = 'cypher-ai-awards' and founded = '';
update public.listings set founded = '2015' where slug = 'tiecon-chandigarh' and founded = '';
update public.listings set founded = '2003' where slug = 'open-source-india-osi' and founded = '';
update public.listings set founded = '2014' where slug = 'google-i-o-extended-india' and founded = '';
update public.listings set founded = '2018' where slug = 'aws-community-day-india' and founded = '';
update public.listings set founded = '2009' where slug = 'pycon-india' and founded = '';
update public.listings set founded = '2011' where slug = 'jsfoo-india' and founded = '';
update public.listings set founded = '2017' where slug = 'anthill-inside' and founded = '';
update public.listings set founded = '2011' where slug = 'rootconf' and founded = '';
update public.listings set founded = '2005' where slug = 'agile-india-summit' and founded = '';
update public.listings set founded = '2021' where slug = 'github-galaxy-india' and founded = '';
update public.listings set founded = '2024' where slug = 'bharat-mobility-global-expo' and founded = '';
update public.listings set founded = '2015' where slug = 'cyber-intelligence-asia-india' and founded = '';
update public.listings set founded = '2008' where slug = 'great-international-developer-summit-gids' and founded = '';
update public.listings set founded = '2015' where slug = 'et-startup-awards-summit' and founded = '';
update public.listings set founded = '2013' where slug = 'business-today-mindrush' and founded = '';
