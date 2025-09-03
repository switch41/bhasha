import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type MaybeString = string | undefined;

function resolveSupabaseEnv(): { url: MaybeString; anon: MaybeString } {
  const viteUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL as MaybeString;
  const viteAnon = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as MaybeString;

  let runtimeUrl: MaybeString;
  let runtimeAnon: MaybeString;

  try {
    runtimeUrl =
      (globalThis as any)?.__SUPABASE_URL ||
      (globalThis as any)?.SUPABASE_URL ||
      (typeof localStorage !== "undefined" ? localStorage.getItem("SUPABASE_URL") || undefined : undefined);

    runtimeAnon =
      (globalThis as any)?.__SUPABASE_ANON_KEY ||
      (globalThis as any)?.SUPABASE_ANON_KEY ||
      (typeof localStorage !== "undefined" ? localStorage.getItem("SUPABASE_ANON_KEY") || undefined : undefined);
  } catch {
    // ignore
  }

  return { url: viteUrl || runtimeUrl, anon: viteAnon || runtimeAnon };
}

export function SupabaseConfigGate({ children }: { children: React.ReactNode }) {
  const { url, anon } = useMemo(resolveSupabaseEnv, []);
  const configured = !!url && !!anon;

  const [projectUrl, setProjectUrl] = useState<string>("");
  const [anonKey, setAnonKey] = useState<string>("");

  useEffect(() => {
    // Prefill from any existing values if they exist but incomplete
    try {
      const lsUrl = localStorage.getItem("SUPABASE_URL") || "";
      const lsAnon = localStorage.getItem("SUPABASE_ANON_KEY") || "";
      if (!projectUrl && lsUrl) setProjectUrl(lsUrl);
      if (!anonKey && lsAnon) setAnonKey(lsAnon);
    } catch {
      // ignore
    }
  }, []);

  if (configured) return <>{children}</>;

  const save = () => {
    if (!projectUrl.trim() || !anonKey.trim()) {
      toast.error("Please provide both Project URL and Anon Key.");
      return;
    }
    if (!projectUrl.startsWith("https://") || !projectUrl.includes(".supabase.co")) {
      toast.error("Project URL looks invalid. It should look like: https://xxxxxxxx.supabase.co");
      return;
    }
    try {
      localStorage.setItem("SUPABASE_URL", projectUrl.trim());
      localStorage.setItem("SUPABASE_ANON_KEY", anonKey.trim());
      toast.success("Saved! Reloading...");
      setTimeout(() => location.reload(), 400);
    } catch {
      toast.error("Unable to persist settings (storage blocked). Try another browser or set globals manually.");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Connect to Supabase</h1>
            <p className="text-sm text-muted-foreground">
              Your app needs your Supabase Project URL and Anon Public Key to submit contributions.
              Data is stored locally in your browser and never committed to the codebase.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Project URL</label>
            <Input
              placeholder="https://xxxxxx.supabase.co"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Anon Public Key</label>
            <Input
              type="password"
              placeholder="Paste your anon public key"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={save}>Save & Reload</Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                try {
                  (window as any).__SUPABASE_URL = projectUrl.trim();
                  (window as any).__SUPABASE_ANON_KEY = anonKey.trim();
                  toast.success("Applied for this session. Reloading...");
                  setTimeout(() => location.reload(), 400);
                } catch {
                  toast.error("Failed to apply runtime settings.");
                }
              }}
            >
              Apply for Session
            </Button>
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            Tip: You can also set these via the Integrations panel, or in DevTools Console:
            localStorage.setItem("SUPABASE_URL","..."); localStorage.setItem("SUPABASE_ANON_KEY","...");
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
