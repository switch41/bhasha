import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Resolve from Vite first, then runtime (window/localStorage)
function resolveSupabaseEnv(): { url?: string; anon?: string } {
  // Prefer Vite env first
  const viteUrl =
    (import.meta as any)?.env?.VITE_SUPABASE_URL ||
    (import.meta as any)?.env?.SUPABASE_URL || // accept non-VITE names too
    (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_URL; // support Next-style public var

  const viteAnon =
    (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY ||
    (import.meta as any)?.env?.SUPABASE_ANON_KEY ||
    (import.meta as any)?.env?.SUPABASE_PUBLIC_ANON_KEY || // some integrations use this
    (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || // support Next-style alias
    (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY; // support Next's publishable key

  if (viteUrl && viteAnon) return { url: viteUrl, anon: viteAnon };

  // Fallbacks: globals, integration shims, storage
  let runtimeUrl: string | undefined;
  let runtimeAnon: string | undefined;
  try {
    const g = globalThis as any;
    const w = typeof window !== "undefined" ? (window as any) : undefined;

    runtimeUrl =
      g.__SUPABASE_URL ||
      g.SUPABASE_URL ||
      g.NEXT_PUBLIC_SUPABASE_URL || // add global NEXT_PUBLIC fallback
      g.ENV?.SUPABASE_URL ||
      g.ENV?.NEXT_PUBLIC_SUPABASE_URL || // support Next-style env at runtime
      w?.__ENV?.SUPABASE_URL ||
      w?.__ENV?.NEXT_PUBLIC_SUPABASE_URL || // window-provided
      w?.SUPABASE_URL || // add window global fallback
      w?.NEXT_PUBLIC_SUPABASE_URL || // add window NEXT_PUBLIC fallback
      (typeof localStorage !== "undefined" ? localStorage.getItem("SUPABASE_URL") || undefined : undefined) ||
      (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("SUPABASE_URL") || undefined : undefined);

    runtimeAnon =
      g.__SUPABASE_ANON_KEY ||
      g.SUPABASE_ANON_KEY ||
      g.SUPABASE_PUBLIC_ANON_KEY ||
      g.NEXT_PUBLIC_SUPABASE_ANON_KEY || // add global NEXT_PUBLIC fallback
      g.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || // add global publishable fallback
      g.ENV?.SUPABASE_ANON_KEY ||
      g.ENV?.SUPABASE_PUBLIC_ANON_KEY ||
      g.ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY || // support Next-style runtime vars
      g.ENV?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      w?.__ENV?.SUPABASE_ANON_KEY ||
      w?.__ENV?.SUPABASE_PUBLIC_ANON_KEY ||
      w?.__ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      w?.__ENV?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      w?.SUPABASE_ANON_KEY || // add window global fallback
      w?.SUPABASE_PUBLIC_ANON_KEY || // add window global fallback
      w?.NEXT_PUBLIC_SUPABASE_ANON_KEY || // add window NEXT_PUBLIC fallback
      w?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || // add window NEXT_PUBLIC fallback
      (typeof localStorage !== "undefined" ? localStorage.getItem("SUPABASE_ANON_KEY") || undefined : undefined) ||
      (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("SUPABASE_ANON_KEY") || undefined : undefined);
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
    throw new Error(
      "Supabase client not configured. Provide one of: VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY, SUPABASE_URL/SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY). You can also set SUPABASE_URL and SUPABASE_ANON_KEY on window/global/localStorage."
    );
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
          "Supabase client not configured. Ensure one of: VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY, SUPABASE_URL/SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY). Alternatively, set SUPABASE_URL/SUPABASE_ANON_KEY via window/global/localStorage."
        );
      },
    },
  ) as SupabaseClient;
})();