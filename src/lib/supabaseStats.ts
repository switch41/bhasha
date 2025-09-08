// Aggregates user statistics from Supabase tables to replace Convex queries
import { getSupabaseClient } from "@/lib/supabase";

export type UserStats = {
  totalContributions: number;
  weeklyStreak: number;
  languageBreakdown: Record<string, number>;
  badges: string[];
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatSupabaseError(e: any): string {
  return e?.message || e?.error_description || e?.hint || "Unknown error";
}

export async function getUserStats(userEmail: string): Promise<UserStats> {
  const sb = getSupabaseClient();
  const today = startOfDay(new Date());
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  // Fetch counts in parallel
  const [textRes, audioRes] = await Promise.all([
    sb
      .from("text_contributions")
      .select("language, created_at", { count: "exact" })
      .eq("user_email", userEmail),
    sb
      .from("audio_contributions")
      .select("language, created_at", { count: "exact" })
      .eq("user_email", userEmail),
  ]);

  if (textRes.error) throw new Error(`Failed to fetch text stats: ${formatSupabaseError(textRes.error)}`);
  if (audioRes.error) throw new Error(`Failed to fetch audio stats: ${formatSupabaseError(audioRes.error)}`);

  const textRows = (textRes.data ?? []) as Array<{ language: string; created_at: string }>;
  const audioRows = (audioRes.data ?? []) as Array<{ language: string; created_at: string }>;

  const allRows = [...textRows, ...audioRows];

  // Total contributions
  const totalContributions = (textRes.count ?? 0) + (audioRes.count ?? 0);

  // Language breakdown
  const languageBreakdown: Record<string, number> = {};
  for (const row of allRows) {
    const lang = row.language || "unknown";
    languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;
  }

  // Weekly streak = contributions on how many distinct days in last 7 days
  const daysWithContrib = new Set<string>();
  for (const row of allRows) {
    const created = new Date(row.created_at);
    if (created >= sevenDaysAgo && created <= new Date()) {
      daysWithContrib.add(startOfDay(created).toISOString().slice(0, 10));
    }
  }
  const weeklyStreak = daysWithContrib.size;

  // Badges (simple client-side rules)
  const badges: string[] = [];
  if (totalContributions >= 1) badges.push("First Contribution");
  if (totalContributions >= 10) badges.push("Contributor x10");
  if (totalContributions >= 50) badges.push("Contributor x50");
  if (Object.keys(languageBreakdown).length >= 2) badges.push("Multilingual");
  if (weeklyStreak >= 3) badges.push("3-Day Streak");
  if (weeklyStreak >= 7) badges.push("Weekly Warrior");

  return { totalContributions, weeklyStreak, languageBreakdown, badges };
}
