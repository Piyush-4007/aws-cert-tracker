"use client";

import { useEffect, useState } from "react";

export const MS_PER_DAY = 86_400_000;

/** Local-midnight timestamp for a `yyyy-mm-dd` string. */
export function parseDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export function daysBetween(fromMs: number, toMs: number): number {
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

/**
 * Today's local-midnight timestamp, or null on the server / first paint.
 * Keeping it null until mount avoids a build-time date leaking into the HTML.
 */
export function useToday(): number | null {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    setToday(startOfToday());
    const id = window.setInterval(() => setToday(startOfToday()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return today;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
