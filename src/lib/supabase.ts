import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Resolve from Vite first, then runtime (window/localStorage)
function resolveSupabaseEnv(): { url?: string; anon?: string } {
  const viteUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
  const viteAnon = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (viteUrl && viteAnon) return { url: viteUrl, anon: viteAnon };

  let runtimeUrl: string | undefined;
  let runtimeAnon: string | undefined;
  try {
    runtimeUrl =
      (globalThis as any).__SUPABASE_URL ||
      (globalThis as any).SUPABASE_URL ||
      (typeof localStorage !== "undefined" ? localStorage.getItem("SUPABASE_URL") || undefined : undefined);

    runtimeAnon =
      (globalThis as any).__SUPABASE_ANON_KEY ||
      (globalThis as any).SUPABASE_ANON_KEY ||
      (typeof localStorage !== "undefined" ? localStorage.getItem("SUPABASE_ANON_KEY") || undefined : undefined);
  } catch {
    // ignore storage access errors
  }
  return { url: runtimeUrl, anon: runtimeAnon };
}

let _client: SupabaseClient | null = null;

// Lazily initialize and return the client. Throws only when actually used without config.
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const { url, anon } = resolveSupabaseEnv();
  if (!url || !anon) {
    throw new Error("Supabase client not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or provide runtime keys in SupabaseConfigGate.");
  }

  _client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _client;
}

// Safe default export that instantiates only if config is available now.
export const supabase: SupabaseClient = (() => {
  try {
    const { url, anon } = resolveSupabaseEnv();
    if (url && anon) {
      return getSupabaseClient();
    }
  } catch {
    // ignore, return proxy below
  }
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          "Supabase client not configured. Open the app and enter keys via the SupabaseConfigGate or provide VITE_SUPABASE_* envs."
        );
      },
    },
  ) as SupabaseClient;
})();