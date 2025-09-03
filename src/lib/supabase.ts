import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Vite client-side env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Throw at module init so we catch misconfigurations early
  throw new Error(
    "Missing Supabase env vars. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

// Narrow types after runtime guard
const url: string = supabaseUrl;
const key: string = supabaseAnonKey;

// Singleton client for the frontend
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _client;
}

// Convenient default export
export const supabase = getSupabaseClient();