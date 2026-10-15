'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../supabase.types';

/** Browser client: publishable/anon key only; NEVER the service_role key. */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase browser configuration is missing. See app/.env.example');
  }
  // The linked project's generator targets PostgREST 14, whereas the currently
  // installed Supabase JS types may predate versioned PostgREST definitions.
  // Keep the generated table schema while using the library's default API version.
  return createBrowserClient<Omit<Database, '__InternalSupabase'>>(url, key);
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}
