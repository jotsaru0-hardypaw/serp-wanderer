# Rank Tracker

A small, self-hosted keyword rank tracker: add domains, add keywords per domain,
and it checks Google positions via **Bright Data's SERP API** on a daily
schedule (or on demand). Positions are stored over time so you get a trend
line per keyword — a lightweight SerpBear-style dashboard, purpose-built
around Bright Data instead of SerpBear's other scraper integrations.

## How it works

- Each keyword check calls Bright Data's SERP API (`data_format: parsed_light`),
  which returns ~10 Google organic results per request as clean JSON — no
  HTML parsing.
- The app compares each result's hostname against your tracked domain. If
  your domain isn't found on the first page, it pages through further
  requests (`start=10`, `20`, ...) up to the **check depth** configured on
  the Settings page (10 / 30 / 50 / 100 — 100 by default), stopping the
  moment a match is found. A keyword ranking #3 only ever costs one Bright
  Data request; a keyword that isn't ranking at all costs one request per
  page of depth configured (worst case, 10 requests at the 100 setting).
- Every check is stored as a row in `RankCheck`, so the dashboard can show a
  history/trend per keyword, not just the latest number.

**Cost and time tradeoff:** checking deeper means more Bright Data requests
per keyword for anything that isn't already ranking well, which uses more
credits and takes longer. If you're tracking a lot of keywords or want to
conserve credits, drop the check depth to 10 or 30 on the Settings page —
you can change it any time, it just affects checks going forward.

**Bulk add & tags:** the "Add in bulk" tab on a domain's page takes one
keyword per line and applies the same tags/location/device to all of them.
Bulk-added keywords aren't checked immediately (to avoid timing out on large
batches) — hit "Refresh now" afterward to check them. Tags are free-form
labels you can filter by using the dropdown above the keyword table.

**Selecting keywords:** check the boxes next to any keywords to check or
remove several at once — useful after a bulk add, or when cleaning up a
batch of old ones.

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Get a Postgres database.** Any works — [Neon](https://neon.tech) and
   [Render Postgres](https://render.com/docs/databases) both have generous
   free tiers and work identically with this app. Copy the connection string.

3. **Copy `.env.example` to `.env`** and fill in:
   - `DATABASE_URL` — your Postgres connection string
   - `CRON_SECRET` — any long random string (e.g. `openssl rand -base64 32`)

   Your Bright Data API key, zone name, and default search location are
   entered through the app itself (Settings page) once it's running — not
   env vars. The commented-out env vars in `.env.example` are only there as
   an optional fallback if you'd rather configure those two via env/CI
   instead of the UI.

4. **Push the schema to your database**
   ```bash
   npm run db:push
   ```

5. **Run it**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 — you'll see a banner prompting you to add
   your Bright Data API key and zone on the **Settings** page first. Once
   that's saved, add a domain, add a keyword, and it checks immediately so
   you'll see a result right away.

## Deploying

### Option A — Vercel

1. Push this repo to GitHub, then import it in Vercel.
2. Add the same environment variables from `.env` in Vercel's project settings.
3. `vercel.json` already defines a daily cron (`0 6 * * *` — 6am UTC) hitting
   `/api/cron/refresh`. Vercel automatically sends your `CRON_SECRET` as the
   `Authorization` header on that scheduled call — no extra config needed.
4. **Free (Hobby) plan caveat:** Hobby functions time out at 10 seconds
   regardless of `maxDuration`. With the default 100-position check depth, a
   *single* keyword check that isn't ranking at all can take longer than
   that on its own — not just the scheduled bulk refresh. If you're on
   Hobby, either drop the check depth to 10 or 30 on the Settings page, or
   upgrade to Pro (which honors the `maxDuration` values already set in the
   routes, up to 300s).

### Option B — Render

1. Push to GitHub, create a **Web Service** on Render from the repo.
   Build command: `npm run build`. Start command: `npm run start`.
2. Add the same environment variables.
3. Add Render's **Cron Job** (a separate service type) set to hit your app's
   `/api/cron/refresh?secret=YOUR_CRON_SECRET` daily via `curl`:
   ```bash
   curl "https://your-app.onrender.com/api/cron/refresh?secret=$CRON_SECRET"
   ```
   Render's cron jobs aren't limited to 10 seconds the way Vercel Hobby is,
   so this is the more comfortable option for a larger keyword list.

Either way, you can also just click **"Refresh now"** on a domain's page any
time — it doesn't wait for the schedule.

## Extending

- **More history / different chart range:** `checks` are fetched with
  `take: 30` in `app/domains/[id]/page.tsx` and `app/api/domains/[id]/route.ts`
  — raise that if you want a longer trend line.
- **Other search engines / countries:** `lib/brightdata.ts` passes `gl`/`hl`
  straight through to Google; Bright Data also supports Bing, Yandex, etc. if
  you want to add an `engine` field per keyword later.
- **Email alerts on position changes:** not built in yet — `lib/rank.ts` is
  the natural place to add a comparison + notification step after each check.
- **Auth:** this MVP has no login — it assumes a private deployment. Add
  Vercel/Render access controls or a simple password gate if you're exposing
  it publicly.
