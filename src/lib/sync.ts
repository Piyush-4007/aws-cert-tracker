"use client";

import { isCloudEnabled, supabase, type CloudUser } from "./supabase";
import {
  applyRemote,
  emptyState,
  exportState,
  reconcile,
  setMutationListener,
  type Change,
  type ProgressState,
} from "./store";
import { validIds } from "./roadmap";

const QUEUE_KEY = "aws-cert-tracker:queue";

export type SyncStatus =
  | "disabled" // no Supabase credentials in this build
  | "signed-out"
  | "loading"
  | "ready"
  | "saving"
  | "error";

export interface SyncState {
  status: SyncStatus;
  user: CloudUser | null;
  pending: number;
  lastSyncedAt: string | null;
  error: string | null;
}

let sync: SyncState = {
  status: isCloudEnabled ? "loading" : "disabled",
  user: null,
  pending: 0,
  lastSyncedAt: null,
  error: null,
};

const listeners = new Set<() => void>();
let started = false;

function set(patch: Partial<SyncState>) {
  sync = { ...sync, ...patch };
  for (const l of listeners) l();
}

export function subscribeSync(listener: () => void): () => void {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSyncSnapshot(): SyncState {
  ensureStarted();
  return sync;
}

const serverSync: SyncState = {
  status: isCloudEnabled ? "loading" : "disabled",
  user: null,
  pending: 0,
  lastSyncedAt: null,
  error: null,
};

export function getSyncServerSnapshot(): SyncState {
  return serverSync;
}

/* ------------------------------------------------------------- the queue */

interface Queue {
  upserts: string[];
  deletes: string[];
  settings: boolean;
  full: boolean;
}

const emptyQueue = (): Queue => ({ upserts: [], deletes: [], settings: false, full: false });

function readQueue(): Queue {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return emptyQueue();
    const q = JSON.parse(raw) as Partial<Queue>;
    return {
      upserts: Array.isArray(q.upserts) ? q.upserts : [],
      deletes: Array.isArray(q.deletes) ? q.deletes : [],
      settings: Boolean(q.settings),
      full: Boolean(q.full),
    };
  } catch {
    return emptyQueue();
  }
}

function writeQueue(q: Queue) {
  try {
    if (!q.upserts.length && !q.deletes.length && !q.settings && !q.full) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    }
  } catch {
    /* ignore */
  }
  set({ pending: q.upserts.length + q.deletes.length + (q.settings ? 1 : 0) + (q.full ? 1 : 0) });
}

function enqueue(change: Change) {
  const q = readQueue();
  if (change.kind === "replace") {
    writeQueue({ upserts: [], deletes: [], settings: true, full: true });
  } else if (change.kind === "settings") {
    q.settings = true;
    writeQueue(q);
  } else {
    // Last write wins per item: a tick cancels a pending untick and vice versa.
    const up = new Set(q.upserts);
    const del = new Set(q.deletes);
    for (const id of change.checked) {
      del.delete(id);
      up.add(id);
    }
    for (const id of change.unchecked) {
      up.delete(id);
      del.add(id);
    }
    writeQueue({ ...q, upserts: [...up], deletes: [...del] });
  }
  scheduleFlush();
}

/* -------------------------------------------------------------- flushing */

let flushTimer: number | null = null;
let flushing = false;
let backoff = 0;

function scheduleFlush(delay = 600) {
  if (typeof window === "undefined") return;
  if (flushTimer !== null) window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flush();
  }, delay);
}

async function flush(): Promise<void> {
  if (flushing || !supabase || !sync.user) return;
  const q = readQueue();
  if (!q.upserts.length && !q.deletes.length && !q.settings && !q.full) return;

  flushing = true;
  set({ status: "saving", error: null });
  const userId = sync.user.id;
  const local = exportState();

  try {
    if (q.full) {
      await pushEverything(userId, local);
    } else {
      if (q.upserts.length) {
        const rows = q.upserts
          .filter((id) => validIds.has(id))
          .map((item_id) => ({ user_id: userId, item_id }));
        if (rows.length) {
          const { error } = await supabase
            .from("progress")
            .upsert(rows, { onConflict: "user_id,item_id" });
          if (error) throw error;
        }
      }
      if (q.deletes.length) {
        const { error } = await supabase
          .from("progress")
          .delete()
          .eq("user_id", userId)
          .in("item_id", q.deletes);
        if (error) throw error;
      }
      if (q.settings) await pushSettings(userId, local);
    }

    writeQueue(emptyQueue());
    backoff = 0;
    set({ status: "ready", lastSyncedAt: new Date().toISOString(), error: null });
  } catch (err) {
    // Keep the queue; it's already on disk, so a refresh won't lose the writes.
    backoff = Math.min(backoff ? backoff * 2 : 2000, 60_000);
    set({
      status: "error",
      error: err instanceof Error ? err.message : "Could not reach the server",
    });
    scheduleFlush(backoff);
  } finally {
    flushing = false;
  }
}

async function pushSettings(userId: string, local: ProgressState) {
  if (!supabase) return;
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      exam_dates: local.examDates,
      sort_by_weight: local.sortByWeight,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

/** Makes the server match local exactly. Used for import, reset and migration. */
async function pushEverything(userId: string, local: ProgressState) {
  if (!supabase) return;
  const { error: delErr } = await supabase.from("progress").delete().eq("user_id", userId);
  if (delErr) throw delErr;

  const ids = Object.keys(local.checked).filter((id) => validIds.has(id));
  for (let i = 0; i < ids.length; i += 500) {
    const rows = ids.slice(i, i + 500).map((item_id) => ({ user_id: userId, item_id }));
    const { error } = await supabase.from("progress").insert(rows);
    if (error) throw error;
  }
  await pushSettings(userId, local);
}

/* ------------------------------------------------------------ pulling ---- */

async function pullRemote(userId: string): Promise<ProgressState> {
  if (!supabase) return emptyState;

  const rows: { item_id: string }[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("progress")
      .select("item_id")
      .eq("user_id", userId)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }

  const { data: settings, error: sErr } = await supabase
    .from("user_settings")
    .select("exam_dates, sort_by_weight")
    .eq("user_id", userId)
    .maybeSingle();
  if (sErr) throw sErr;

  const checked: Record<string, true> = {};
  for (const r of rows) checked[r.item_id] = true;

  return reconcile({
    version: 1,
    checked,
    hashes: {},
    examDates: (settings?.exam_dates as Record<string, string>) ?? {},
    sortByWeight: Boolean(settings?.sort_by_weight),
    savedAt: null,
  });
}

/* ---------------------------------------------------------- auth wiring */

async function onSignedIn(user: CloudUser) {
  set({ status: "loading", user, error: null });
  try {
    const remote = await pullRemote(user.id);
    const local = exportState();
    const remoteEmpty =
      Object.keys(remote.checked).length === 0 && Object.keys(remote.examDates).length === 0;
    const localHasWork = Object.keys(local.checked).length > 0;

    if (remoteEmpty && localHasWork) {
      // First sign-in on a device that already has offline progress: carry it up
      // rather than wiping it with an empty account.
      await pushEverything(user.id, local);
      set({ status: "ready", lastSyncedAt: new Date().toISOString() });
    } else {
      // The account is the source of truth from here on.
      applyRemote(remote);
      writeQueue(emptyQueue());
      set({ status: "ready", lastSyncedAt: new Date().toISOString() });
    }
    scheduleFlush(0);
  } catch (err) {
    set({
      status: "error",
      error: err instanceof Error ? err.message : "Could not load your saved progress",
    });
  }
}

function toCloudUser(u: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): CloudUser {
  const meta = u.user_metadata ?? {};
  return {
    id: u.id,
    email: u.email ?? null,
    name: (meta.full_name as string) ?? (meta.name as string) ?? null,
    avatarUrl: (meta.avatar_url as string) ?? (meta.picture as string) ?? null,
  };
}

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;

  if (!supabase) {
    sync = { ...sync, status: "disabled" };
    return;
  }

  setMutationListener((change) => {
    if (sync.user) enqueue(change);
  });

  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) void onSignedIn(toCloudUser(data.session.user));
    else set({ status: "signed-out", user: null });
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session?.user) {
      set({ status: "signed-out", user: null, pending: 0, error: null });
      return;
    }
    if (sync.user?.id === session.user.id && sync.status === "ready") return;
    void onSignedIn(toCloudUser(session.user));
  });

  window.addEventListener("online", () => scheduleFlush(0));
  // Best-effort final push when the tab goes away.
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flush();
  });

  set({ pending: 0 });
}

/* -------------------------------------------------------------- actions */

export async function signInWithGoogle() {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) set({ status: "error", error: error.message });
}

export async function signOut() {
  if (!supabase) return;
  await flush();
  await supabase.auth.signOut();
  // Leave local progress in place so the device still works signed out.
  set({ status: "signed-out", user: null, pending: 0 });
}

export function retrySync() {
  scheduleFlush(0);
}
