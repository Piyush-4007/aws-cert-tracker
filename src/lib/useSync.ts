"use client";

import { useSyncExternalStore } from "react";
import { getSyncServerSnapshot, getSyncSnapshot, subscribeSync, type SyncState } from "./sync";

export function useSync(): SyncState {
  return useSyncExternalStore(subscribeSync, getSyncSnapshot, getSyncServerSnapshot);
}
