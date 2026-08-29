"use client";

import { hashById, idByScopedHash, validIds } from "./roadmap";

export const STORAGE_KEY = "aws-cert-tracker:v1";
export const THEME_KEY = "aws-cert-tracker:theme";

export interface ProgressState {
  version: 1;
  /** itemId -> true. Only checked items are stored. */
  checked: Record<string, true>;
  /** itemId -> scoped content hash, so a moved item keeps its tick. */
  hashes: Record<string, string>;
  /** certId -> yyyy-mm-dd */
  examDates: Record<string, string>;
  sortByWeight: boolean;
  savedAt: string | null;
}

export const emptyState: ProgressState = {
  version: 1,
  checked: {},
  hashes: {},
  examDates: {},
  sortByWeight: false,
  savedAt: null,
};

/* ------------------------------------------------------------ reconciling */

/**
 * Maps a saved payload onto the roadmap as it exists right now.
 *  - ids that still exist keep their tick
 *  - ids that vanished but whose text still exists elsewhere in the same
 *    certification follow the text to its new id
 *  - anything else is dropped, and new roadmap items simply start unchecked
 */
export function reconcile(raw: unknown): ProgressState {
  const next: ProgressState = { ...emptyState, checked: {}, hashes: {}, examDates: {} };
  if (!raw || typeof raw !== "object") return next;
  const input = raw as Partial<ProgressState>;

  const checked = input.checked ?? {};
  const hashes = input.hashes ?? {};

  for (const id of Object.keys(checked)) {
    if (!checked[id]) continue;
    if (validIds.has(id)) {
      next.checked[id] = true;
      const h = hashById.get(id);
      if (h) next.hashes[id] = h;
      continue;
    }
    const savedHash = hashes[id];
    const moved = savedHash ? idByScopedHash.get(savedHash) : undefined;
    if (moved && !next.checked[moved]) {
      next.checked[moved] = true;
      next.hashes[moved] = savedHash;
    }
  }

  if (input.examDates && typeof input.examDates === "object") {
    for (const [certId, date] of Object.entries(input.examDates)) {
      if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        next.examDates[certId] = date;
      }
    }
  }
  next.sortByWeight = Boolean(input.sortByWeight);
  next.savedAt = typeof input.savedAt === "string" ? input.savedAt : null;
  return next;
}

/* ---------------------------------------------------------- the store ---- */

let state: ProgressState = emptyState;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    return reconcile(JSON.parse(raw));
  } catch {
    return emptyState;
  }
}

function writeStorage(value: ProgressState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* private mode / quota — the session still works, it just won't persist */
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  const raw = (() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  })();
  state = readStorage();
  loaded = true;
  // Write the reconciled shape back so a roadmap edit doesn't leave dead ids behind.
  if (raw && JSON.stringify(state) !== raw) writeStorage(state);
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    state = readStorage();
    emit();
  });
}

function emit() {
  for (const l of listeners) l();
}

export function subscribe(listener: () => void): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ProgressState {
  ensureLoaded();
  return state;
}

export function getServerSnapshot(): ProgressState {
  return emptyState;
}

function commit(next: ProgressState) {
  state = { ...next, savedAt: new Date().toISOString() };
  writeStorage(state);
  emit();
}

/* -------------------------------------------------------------- mutations */

export function toggleItem(id: string) {
  const checked = { ...state.checked };
  const hashes = { ...state.hashes };
  if (checked[id]) {
    delete checked[id];
    delete hashes[id];
  } else {
    checked[id] = true;
    const h = hashById.get(id);
    if (h) hashes[id] = h;
  }
  commit({ ...state, checked, hashes });
}

export function setMany(ids: string[], value: boolean) {
  const checked = { ...state.checked };
  const hashes = { ...state.hashes };
  for (const id of ids) {
    if (value) {
      checked[id] = true;
      const h = hashById.get(id);
      if (h) hashes[id] = h;
    } else {
      delete checked[id];
      delete hashes[id];
    }
  }
  commit({ ...state, checked, hashes });
}

export function setExamDate(certId: string, date: string | null) {
  const examDates = { ...state.examDates };
  if (date) examDates[certId] = date;
  else delete examDates[certId];
  commit({ ...state, examDates });
}

export function setSortByWeight(value: boolean) {
  commit({ ...state, sortByWeight: value });
}

export function resetAll() {
  commit({ ...emptyState });
}

export function importState(raw: unknown) {
  commit(reconcile(raw));
}

export function exportState(): ProgressState {
  ensureLoaded();
  return state;
}
