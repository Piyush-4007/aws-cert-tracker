# AWS Certification Progress Tracker

A study tracker for four AWS certifications — CLF-C02, AIF-C01, SAA-C03 and DVA-C02 — built from
`aws-cert-roadmap.md`. Sign in with Google and your progress follows you to any device. It installs
to a phone home screen and keeps working with no connection.

**400 study items** across 4 certifications, 17 domains and 58 subsections, plus a 5-step post-exam
checklist tracked separately per certification. Every number in the UI is computed from the parsed
item counts — nothing is hardcoded.

**Live at <https://aws-cert-tracker-trail-blazer1.vercel.app>**

---

## Using it

Open the link, tap **Sign in**, pick your Google account. That's the whole setup. Tick things off;
everything saves by itself.

Each person only ever sees their own progress. That isolation is enforced by the database, not by
the app.

### Installing it on your phone (optional)

There is no separate app to download and nothing in any app store. Installing just puts the same
site on your home screen with its own icon, opened without a browser bar.

- **Android** — open the link in Chrome or Brave, then menu (⋮) → **Add to Home screen**
- **iPhone** — open the link in Safari, then Share → **Add to Home Screen**

Nothing changes if you skip it. Same site, same account, same progress — you just keep using it in
the browser. The one thing installing adds is offline use: once a page has been opened, it will
open again with no signal, and anything you tick offline is uploaded next time you're connected.

---

## Setup

Requires **Node 22.6 or newer** — the parser is a TypeScript file run directly through Node's
type stripping, so there is no build-tool dependency and nothing with a native binary to install.

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

## Commands

| Command | What it does |
| --- | --- |
| `npm run parse` | Parses `aws-cert-roadmap.md` into `src/data/roadmap.json` |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Runs the parser, then builds the static export into `out/` |
| `npm start` | Serves a production build |

## Deploying to Vercel

The app is a static export (`output: "export"` in `next.config.ts`), so no Vercel settings need
changing — the build command in `package.json` re-runs the parser and Vercel picks up `out/`.
`engines.node` pins the build to a Node version that can run the parser.

First deployment:

```bash
npx vercel login
```

```bash
npx vercel deploy
```

Promote it to a permanent production URL:

```bash
npx vercel deploy --prod
```

`vercel` prints the URL when it finishes. Open that on your phone — the layout is built for it:
no horizontal scrolling at 375px, larger checkbox targets on touch screens, and the same
`localStorage` persistence.

Note that progress is stored per browser. Ticking items on your phone will not show up on your
laptop; use **Data → Export / Import** to move a snapshot between them.

## Editing the roadmap

`aws-cert-roadmap.md` is the single source of truth. Edit it, then:

```bash
npm run parse
```

Item IDs are derived from their path in the document (`saa-c03.d1.1-1.item-04`) rather than an array
index, and each item also carries a short hash of its text. On load, saved progress is reconciled
against the current roadmap:

- an item whose ID still exists keeps its tick
- an item that **moved** but whose text is unchanged keeps its tick — the hash follows it to its new ID
- an item that was deleted or reworded is dropped
- newly added items start unchecked

The parser fails loudly rather than writing bad data: it checks that the item count matches the
markdown, that every ID is unique, that no section is empty, and that each certification's domain
weights sum to 100%.

## What's in it

**Overview** (`/`) — days remaining until the 29 Jan 2027 voucher expiry, combined progress, items
still to do and the daily rate needed to finish in time. Four certification cards in study order;
ones later in the sequence are dimmed but still clickable.

**Certification** (`/cert/[id]`) — exam facts, the "revise from" carry-over topics as a distinct
panel, then collapsible domains with their weight and progress. Per-subsection *All* / *None*
controls, a filter box that highlights matches, an optional sort by domain weight (heaviest first),
a planned exam date with an items-per-day pace signal, and a red flag if the date falls after the
voucher expires.

**Weak spots** (`/weak-spots`) — every subsection across all four exams sitting below 50%, split
into "started but behind" and "not started", heaviest domains first.

**Data** (`/data`) — account and sync status, export progress to JSON, import it back, and reset
behind a confirmation.

## Installable / offline

A web app manifest plus a service worker make the site installable to a home screen and usable with
no connection. The worker does runtime caching only — there is no precache manifest to fall out of
step with a build:

- navigations are **network-first**, so a new deploy is picked up as soon as you are online, falling
  back to cache and then to the app shell when you are not
- `/_next/static` is **cache-first**, which is safe because those URLs are content-hashed: a new
  build produces new URLs rather than stale hits
- cross-origin requests are **never intercepted**. Supabase in particular must not be served from a
  cache, and the write queue already handles being offline

Icons are committed as PNGs. `node scripts/make-icons.mjs` regenerates them from the SVG sources
and is deliberately kept out of `npm run build`, so a deploy never depends on `sharp`.

## Accounts and sync

Google sign-in backed by Supabase, so progress follows you across devices. This is switched on by
the presence of `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; without them the app
falls back to `localStorage` alone and hides the sign-in UI entirely. There is no degraded state and
no error — a build with no credentials is simply the single-user version.

Sign-up is open to anyone with the link. Row Level Security still confines every row to its owner,
so a stranger who signs in gets their own empty tracker and can never see anyone else's.

See [ACCOUNTS-SETUP.md](ACCOUNTS-SETUP.md) for the one-time setup, and `supabase/schema.sql` for the
two tables. Row Level Security restricts every row to its owner, enforced by Postgres rather than by
application code. Note that the policies alone are not enough: Postgres checks table-level
privileges before it evaluates a row policy, so the schema also grants `authenticated` explicit
access and revokes `anon` entirely. Without those grants every query fails with
`permission denied` (SQLSTATE 42501) despite correct policies.

Ticking always writes to `localStorage` first and queues a background sync, so the checkbox never
waits on the network and the page keeps working offline. The queue is persisted, so a refresh
mid-outage doesn't drop writes. On first sign-in, progress already saved in the browser is uploaded
into the account instead of being overwritten by it.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>/</kbd> | Focus the filter box |
| <kbd>Esc</kbd> | Clear the filter |
| <kbd>j</kbd> / <kbd>k</kbd> | Move down / up between checkboxes |
| <kbd>Space</kbd> | Tick the focused item |
| <kbd>Tab</kbd> | Everything else — all controls are native and focusable |

## Structure

```
aws-cert-roadmap.md          source of truth
scripts/parse-roadmap.ts     markdown -> JSON, with validation
src/data/roadmap.json        generated; safe to delete and regenerate
src/lib/roadmap.ts           lookups, ID/hash indexes
src/lib/store.ts             localStorage store + reconciliation
src/lib/sync.ts              Supabase auth + offline-tolerant write queue
src/lib/supabase.ts          client, or null when no credentials are configured
public/sw.js                 service worker: offline support and home-screen install
public/manifest.webmanifest  web app manifest
scripts/make-icons.mjs       regenerates the icon PNGs (not part of the build)
src/lib/useProgress.ts       useSyncExternalStore binding, tallies
supabase/schema.sql          tables and row-level security policies
src/app/                     routes
src/components/              UI
```

Progress lives in a module-level store outside React and is written to `localStorage` on every
change, so it survives re-renders, client-side navigation and refreshes. Changes in one tab
propagate to others via the `storage` event.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (auth + Postgres) · static export,
deployed on Vercel. The Supabase client runs in the browser, so there is no server of our own and
the whole app remains a static export.
