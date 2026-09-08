# Rank Tracker

A small, self-hosted keyword rank tracker: add domains, add keywords per domain,
and it checks Google positions via **Bright Data's SERP API** on a daily
schedule (or on demand). Positions are stored over time so you get a trend
line per keyword — a lightweight SerpBear-style dashboard, purpose-built
around Bright Data instead of SerpBear's other scraper integrations.

## How it works

- Each keyword check calls Bright Data's SERP API (`data_format: parsed_light`),
  which returns the top ~10 Google organic results as clean JSON — no HTML
  parsing.
- The app compares each result's hostname against your tracked domain and
  records the matching position (or `null` if your domain isn't in the top
  results returned).
- Every check is stored as a row in `RankCheck`, so the dashboard can show a
  history/trend per keyword, not just the latest number.

**Note on depth:** Bright Data's `parsed_light` format returns page 1 (~10
results). If a keyword ranks beyond position 10, it'll show as "Not found"
rather than its true position. `lib/brightdata.ts` already supports paging
via the `page` argument (uses Google's `start` param) if you want to extend
`checkKeyword` to check further pages for specific keywords — just uncomment
and wire that in if you need deeper visibility for a subset of terms. Going
deeper multiplies the number of API calls (and cost) per keyword, so it's
left as an opt-in rather than default behavior.

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
4. **Free (Hobby) plan caveat:** Hobby functions time out at 10 seconds, which
   may not be enough to check many keywords sequentially in one run. If you
   have more than a handful of keywords, either upgrade to Pro (function
   timeout configurable up to 300s — already set via `maxDuration` in the
   route) or use Option B below for the scheduled check.

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
