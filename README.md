# Startup Login — startuplogin.com

**The discovery platform for Indian startups.** An interactive map + directory of
Indian startups and VCs, searchable and filterable by city, state, sector, stage
and type — with a registry-console visual identity: directory-first home, explore workspace, full startup profiles and an India map view. Any startup
can submit a free listing; every submission is reviewed before it goes live.

## Features

- **Map view** — Leaflet map of India with logo pins and colour-coded cluster
  bubbles (Carto Voyager basemap, warm cream style). Zoom from an all-India view
  down to street level per city.
- **Grid view** — card directory with logo, one-liner, and city/sector/stage chips.
- **Filters** — type (Startups/VCs), state, city (narrows by selected state),
  stage, sector, plus full-text search across names, taglines, sectors and founders.
- **Detail panel** — description, founders, industry, key investors, total
  funding, website link, and a shareable deep link (`#/startup/<slug>`).
- **Submit a startup** — free listing form (`#/submit`) with a moderation notice.
- **305 seed listings** — 285 startups from curated research data across 25+
  Indian cities, plus 20 well-known Indian VC firms.

No build step, no framework — plain HTML/CSS/JS with a vendored Leaflet. Deploys
anywhere static files are served.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Any static host works — GitHub Pages, Vercel, Netlify, Cloudflare Pages. Point
the `startuplogin.com` domain at the host and you're live. (Map tiles and logo
favicons load from Carto/Google at runtime in the visitor's browser.)

## Receiving submissions

By default, submissions are stored in the visitor's browser (localStorage) — fine
for demos, not for production. To actually receive them:

1. Create a form endpoint at [Formspree](https://formspree.io) (or Getform/Basin).
2. Put its URL in `config.js` → `formEndpoint`.

Submissions then arrive in your inbox/dashboard as JSON
(`name, website, tagline, city, sector, stage, email`). Approve one by adding it
to the data (see below) and pushing.

## Updating the data

`data/startups.js` is generated from spreadsheet exports by
`scripts/transform_data.py`:

```bash
python3 scripts/transform_data.py sheet1.csv sheet2.xlsx ...
```

It matches columns by header name (Start up Name / Startup Name, Founded Year /
Incorporation Year, Industry, Stage, One Liner, Description, Weblink, Location,
Founder(s), Key Investors, Total Funding), normalises stages and sectors, maps
cities to coordinates (with a deterministic per-startup offset so pins spread
out), merges duplicates across files, and de-duplicates by company name.

**Privacy:** contact emails, phone numbers, LinkedIn URLs, revenue figures and
internal rating/comment columns are deliberately **not** exported to the public
site. Raw source spreadsheets should not be committed to this repo.

VC listings live in `data/vcs.js` (hand-curated, public information).

## Roadmap ideas

- Per-startup and per-city/sector static pages for SEO (programmatic landing pages).
- Admin moderation view backed by a database (Supabase) instead of form email.
- "Claim this listing" flow for founders; "actively hiring" badges.
- Boost/featured slots as a monetisation lane.
