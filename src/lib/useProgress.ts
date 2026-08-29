"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe, type ProgressState } from "./store";

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** False during the very first (server-snapshot) render, true once localStorage is in play. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export interface Tally {
  done: number;
  total: number;
  percent: number;
}

export function tally(ids: string[], checked: Record<string, true>): Tally {
  let done = 0;
  for (const id of ids) if (checked[id]) done++;
  const total = ids.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
