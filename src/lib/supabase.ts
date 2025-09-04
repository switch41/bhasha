import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Replace all multi-source/env/parent/localStorage resolution with ONLY VITE_* vars
const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

// Singleton client for the frontend
let _client: SupabaseClient | null = null;

// Lazily initialize and return the client. Throws only when actually used without config.
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase client not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env."
    );
  }
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _client;
}

// Safe default export: if envs are missing, accessing any property will throw at usage time.
// This avoids crashing the entire app during module import.
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? getSupabaseClient()
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(
            "Supabase client not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env."
          );
        },
      },
    ) as SupabaseClient);