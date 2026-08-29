# AWS Certification Progress Tracker

A personal, single-user study tracker for four AWS certifications — CLF-C02, AIF-C01, SAA-C03 and
DVA-C02 — built from `aws-cert-roadmap.md`. No backend, no accounts: progress lives in the
browser's `localStorage` and the whole thing deploys as a static site.

**400 study items** across 4 certifications, 17 domains and 58 subsections, plus a 5-step post-exam
checklist tracked separately per certification. Every number in the UI is computed from the parsed
item counts — nothing is hardcoded.

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

## Accounts and sync

Optional. With `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, the app adds
Google sign-in and stores progress in Supabase so it follows you across devices. Without them it
runs exactly as before, on `localStorage` alone — there is no degraded state and no error.

See [ACCOUNTS-SETUP.md](ACCOUNTS-SETUP.md) for the one-time setup, and `supabase/schema.sql` for the
two tables. Row Level Security restricts every row to its owner, enforced by Postgres rather than by
application code.

Ticking always writes to `localStorage` first and queues a background sync, so the checkbox never
waits on the network and the page keeps working offline. The queue is persisted, so a refresh
mid-outage doesn't drop writes. On first sign-in, progress already saved in the browser is uploaded
into the account instead of being overwritten by it.

### Keyboard

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
src/lib/useProgress.ts       useSyncExternalStore binding, tallies
supabase/schema.sql          tables and row-level security policies
src/app/                     routes
src/components/              UI
```

Progress lives in a module-level store outside React and is written to `localStorage` on every
change, so it survives re-renders, client-side navigation and refreshes. Changes in one tab
propagate to others via the `storage` event.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · static export. Runtime dependencies: React
and Next only.
