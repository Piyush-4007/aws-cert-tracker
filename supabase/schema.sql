-- AWS Certification Tracker — database schema
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to run again; every statement is guarded.
--
-- Two tables, both locked down by Row Level Security so a signed-in person can
-- only ever read or write their own rows. That isolation is enforced by Postgres
-- itself, not by application code, so a bug in the client cannot leak anyone's
-- progress to anyone else.

-- ---------------------------------------------------------------- progress --
-- One row per ticked checklist item. An unticked item is simply absent, which
-- keeps the table small (a fully complete account is ~420 rows).

create table if not exists public.progress (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  item_id    text        not null,
  checked_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create index if not exists progress_user_id_idx on public.progress (user_id);

alter table public.progress enable row level security;

drop policy if exists "read own progress"   on public.progress;
drop policy if exists "insert own progress" on public.progress;
drop policy if exists "update own progress" on public.progress;
drop policy if exists "delete own progress" on public.progress;

create policy "read own progress"   on public.progress for select using (auth.uid() = user_id);
create policy "insert own progress" on public.progress for insert with check (auth.uid() = user_id);
create policy "update own progress" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own progress" on public.progress for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------- user_settings --
-- Planned exam dates and the sort preference. One row per person.

create table if not exists public.user_settings (
  user_id        uuid        primary key references auth.users (id) on delete cascade,
  exam_dates     jsonb       not null default '{}'::jsonb,
  sort_by_weight boolean     not null default false,
  updated_at     timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "read own settings"   on public.user_settings;
drop policy if exists "insert own settings" on public.user_settings;
drop policy if exists "update own settings" on public.user_settings;
drop policy if exists "delete own settings" on public.user_settings;

create policy "read own settings"   on public.user_settings for select using (auth.uid() = user_id);
create policy "insert own settings" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "update own settings" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own settings" on public.user_settings for delete using (auth.uid() = user_id);
