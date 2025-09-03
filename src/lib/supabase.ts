import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Replace the strict Vite-only env usage with flexible multi-source resolution
// Supports (in order):
// 1) Vite env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
// 2) Runtime globals set by integrations UI: globalThis.__SUPABASE_URL / __SUPABASE_ANON_KEY
// 3) LocalStorage keys: SUPABASE_URL / SUPABASE_ANON_KEY
const viteUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const viteAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let runtimeUrl: string | undefined;
let runtimeAnon: string | undefined;

try {
  // Extend resolution to also check the parent window (iframe host) safely
  const parentGlobal = (() => {
    try {
      return (window as any)?.parent || undefined;
    } catch {
      return undefined;
    }
  })();

  runtimeUrl =
    (globalThis as any)?.__SUPABASE_URL ||
    (globalThis as any)?.SUPABASE_URL ||
    (parentGlobal as any)?.__SUPABASE_URL ||
    (parentGlobal as any)?.SUPABASE_URL ||
    (typeof localStorage !== "undefined" ? localStorage.getItem("SUPABASE_URL") || undefined : undefined);

  runtimeAnon =
    (globalThis as any)?.__SUPABASE_ANON_KEY ||
    (globalThis as any)?.SUPABASE_ANON_KEY ||
    (parentGlobal as any)?.__SUPABASE_ANON_KEY ||
    (parentGlobal as any)?.SUPABASE_ANON_KEY ||
    (typeof localStorage !== "undefined" ? localStorage.getItem("SUPABASE_ANON_KEY") || undefined : undefined);
} catch {
  // ignore access errors (SSR or storage disabled)
}

const supabaseUrl = viteUrl || runtimeUrl;
const supabaseAnonKey = viteAnon || runtimeAnon;

// Singleton client for the frontend
let _client: SupabaseClient | null = null;

// Lazily initialize and return the client. Throws only when actually used without config.
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase client not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or provide runtime __SUPABASE_URL/__SUPABASE_ANON_KEY."
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
            "Supabase client not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or provide runtime __SUPABASE_URL/__SUPABASE_ANON_KEY."
          );
        },
      },
    ) as SupabaseClient);