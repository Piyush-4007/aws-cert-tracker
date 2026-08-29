# Turning on accounts

The app already contains everything needed for Google sign-in and cross-device progress. It stays
in local-only mode until two environment variables are set, so nothing breaks while this is
half-finished.

You have to do the parts below because they need your Google and Supabase logins. Each step says
exactly what to click. Total time is about 15 minutes.

At the end you send me two values and I do the rest.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com> and sign in (GitHub is easiest).
2. **New project**.
   - Name: `aws-cert-tracker`
   - Database password: generate one and save it in your password manager. **Don't send it to me** —
     nothing in this app uses it.
   - Region: **Mumbai** or **Singapore** (closest to you, so the app feels fast).
3. Wait about two minutes for it to finish provisioning.

## 2. Create the tables

1. In the Supabase sidebar: **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this repo, copy the whole file, paste it in.
3. **Run**.

It creates two tables — `progress` and `user_settings` — with Row Level Security switched on, so
each person can only ever read and write their own rows. That is enforced by the database, not by
my code, so nobody can see anyone else's progress even if the app has a bug.

## 3. Set up Google sign-in

**3a. Get the callback URL from Supabase**

Sidebar → **Authentication** → **Providers** → **Google**. Leave the page open; it shows a
**Callback URL** that looks like `https://<something>.supabase.co/auth/v1/callback`. You need it in
a moment.

**3b. Make Google credentials**

1. Go to <https://console.cloud.google.com>.
2. Create a new project (top-left project dropdown → **New Project**). Call it `aws-cert-tracker`.
3. **APIs & Services** → **OAuth consent screen**:
   - User type: **External** → Create
   - App name: `AWS Cert Tracker`
   - User support email and Developer contact email: your own address
   - Save and continue through the remaining steps; you don't need to add scopes or test users.
   - On the summary page, click **Publish app**. Without this, only accounts you list manually can
     sign in — which would block your friends.
4. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**:
   - Application type: **Web application**
   - **Authorised JavaScript origins** — add both:
     - `https://aws-cert-tracker-trail-blazer1.vercel.app`
     - `http://localhost:3000`
   - **Authorised redirect URIs** — add the Supabase callback URL from step 3a
   - Create. Google shows a **Client ID** and **Client secret**.

**3c. Give them to Supabase**

Back on the Supabase Google provider page: paste the Client ID and Client secret, toggle the
provider **on**, and Save.

## 4. Point Supabase at the site

Sidebar → **Authentication** → **URL Configuration**:

- **Site URL**: `https://aws-cert-tracker-trail-blazer1.vercel.app`
- **Redirect URLs**: add `http://localhost:3000/**` as well, so sign-in also works when the app is
  run locally.

## 5. Send me two values

Sidebar → **Project Settings** → **API**. Send me:

- **Project URL** — looks like `https://abcdefgh.supabase.co`
- **anon / public** key — a long string starting `eyJ…`

Both of these are meant to be public. The anon key ends up inside the JavaScript that every visitor
downloads; it grants nothing on its own, because Row Level Security decides what each signed-in
person may touch.

**Do not send** the `service_role` key or the database password. The service_role key bypasses Row
Level Security entirely, and neither belongs anywhere near a browser app.

---

## What I do once you send them

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project.
2. Redeploy — the static build bakes the values in, so this has to happen at build time.
3. Test the full round trip: sign in, tick something, sign in on a second browser, confirm it's there.

## Things worth knowing

**Your existing progress is safe.** The first time you sign in on a device that already has ticks
saved locally, they're uploaded into your new account rather than being wiped by an empty one.
After that the account is the source of truth and the browser copy is just a fast local cache.

**Anyone with the link can sign in.** That was your call and it's a reasonable one for a private
URL, but it does mean a stranger who finds the address could create their own tracker. They could
never see your data — that's what Row Level Security prevents — they'd just be using the app.
If it ever becomes a nuisance, restricting sign-up to a list of email addresses is a small change.

**Free tier limits are far beyond what you need.** A fully completed account is about 420 rows.
Ten people is roughly 4,000 rows against a 500 MB database. The one thing to watch: Supabase pauses
free projects after about a week with no activity. Restoring is one click in the dashboard, and
regular use keeps it awake.

**It still works offline.** Ticking writes to the browser immediately and queues the change; the
queue survives a refresh and drains when the connection comes back. The tick never waits on the
network.
