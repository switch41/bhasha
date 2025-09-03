import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Replace the Vite-only env reads with a union that also supports Next.js-style envs
const viteUrl =
  (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined ||
  ((import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_URL as string | undefined);

const viteAnon =
  (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined ||
  ((import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
  ((import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string | undefined);

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
    (globalThis as any)?.NEXT_PUBLIC_SUPABASE_URL || // support Next-style global
    (parentGlobal as any)?.__SUPABASE_URL ||
    (parentGlobal as any)?.SUPABASE_URL ||
    (parentGlobal as any)?.NEXT_PUBLIC_SUPABASE_URL || // support Next-style in parent
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("SUPABASE_URL") ||
        localStorage.getItem("NEXT_PUBLIC_SUPABASE_URL") || // support Next-style in localStorage
        undefined
      : undefined);

  runtimeAnon =
    (globalThis as any)?.__SUPABASE_ANON_KEY ||
    (globalThis as any)?.SUPABASE_ANON_KEY ||
    (globalThis as any)?.NEXT_PUBLIC_SUPABASE_ANON_KEY || // support Next-style anon
    (globalThis as any)?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || // support publishable key name
    (globalThis as any)?.SUPABASE_PUBLISHABLE_DEFAULT_KEY || // common alt
    (parentGlobal as any)?.__SUPABASE_ANON_KEY ||
    (parentGlobal as any)?.SUPABASE_ANON_KEY ||
    (parentGlobal as any)?.NEXT_PUBLIC_SUPABASE_ANON_KEY || // parent Next-style
    (parentGlobal as any)?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    (parentGlobal as any)?.SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("SUPABASE_ANON_KEY") ||
        localStorage.getItem("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
        localStorage.getItem("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY") ||
        localStorage.getItem("SUPABASE_PUBLISHABLE_DEFAULT_KEY") ||
        undefined
      : undefined);
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