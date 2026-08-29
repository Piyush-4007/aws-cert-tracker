"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cloud sync is optional. With no Supabase credentials configured the whole app
 * still runs exactly as before, backed by localStorage alone — which is what
 * happens in local dev and on any build where the env vars aren't set.
 */
export const isCloudEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isCloudEnabled
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // The OAuth redirect comes back with ?code=… ; the client exchanges it
        // on load, so a static export needs no callback route of its own.
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null;

export interface CloudUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}
