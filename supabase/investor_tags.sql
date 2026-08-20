-- Investor category tags + fixed cities.
-- Run once in the SQL Editor of an EXISTING project (new installs get this
-- from seed.sql automatically). Safe to re-run.

-- Category tags (stored in the sector column for investor listings)
update public.listings set sector = 'VC Funds'
  where type = 'vc' and slug in ('peak-xv-partners','accel-india','blume-ventures',
  'elevation-capital','z47','kalaari-capital','3one4-capital','chiratae-ventures',
  'nexus-venture-partners','lightspeed-india','stellaris-venture-partners',
  'fireside-ventures','india-quotient','prime-venture-partners','antler-india');
update public.listings set sector = 'Micro PE / VC'        where slug = '100x-vc';
update public.listings set sector = 'Family Office'        where slug = 'titan-capital';
update public.listings set sector = 'Angel Networks / Funds'
  where slug in ('venture-catalysts','indian-angel-network');

-- NCR investors fold into Delhi (the investor city list is fixed)
update public.listings set city = 'Delhi', state = 'Delhi NCR'
  where type = 'vc' and city = 'Gurugram';

-- T-Hub is an incubator, outside the investor taxonomy
delete from public.listings where slug = 't-hub';
