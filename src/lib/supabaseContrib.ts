import { supabase } from "@/lib/supabase";

type TextContribution = {
  userEmail: string;
  language: string;
  content: string;
  wordCount?: number;
  difficulty?: string;
};

type VoiceContribution = {
  userEmail: string;
  language: string;
  audioStorageId: string; // Convex storage id for now
  duration?: number;
};

async function getOrCreateLanguageId(code: string): Promise<string> {
  // 1) Try to find by code (ignore is_active to be lenient)
  const { data: langRow, error: selErr } = await supabase
    .from("languages")
    .select("id")
    .eq("code", code)
    .limit(1)
    .maybeSingle();

  if (selErr) {
    // surface the original error to help debugging
    throw selErr;
  }
  if (langRow?.id) return langRow.id;

  // 2) Insert minimal language if missing (safe default names)
  const { data: inserted, error: insErr } = await supabase
    .from("languages")
    .insert({
      code,
      name: code.toUpperCase(),
      native_name: code, // fallback to code if unknown
      is_active: true,
    })
    .select("id")
    .single();

  if (insErr) {
    throw insErr;
  }
  return inserted.id;
}

export async function insertTextContribution({
  userEmail,
  language,
  content,
  wordCount,
  difficulty,
}: TextContribution) {
  // Ensure language exists and get its id
  const languageId = await getOrCreateLanguageId(language);

  // Insert with required language_id (keep legacy 'language' for convenience)
  const { error } = await supabase.from("text_contributions").insert({
    user_email: userEmail,
    language_id: languageId,
    language, // legacy column retained
    content,
    word_count: wordCount,
    difficulty,
    is_validated: false,
    metadata: { wordCount, difficulty },
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function insertVoiceContribution({
  userEmail,
  language,
  audioStorageId,
  duration,
}: VoiceContribution) {
  // Ensure language exists and get its id
  const languageId = await getOrCreateLanguageId(language);

  // Insert with required language_id (keep legacy 'language' for convenience)
  const { error } = await supabase.from("audio_contributions").insert({
    user_email: userEmail,
    language_id: languageId,
    language, // legacy column retained
    audio_storage_id: audioStorageId,
    duration,
    is_validated: false,
    metadata: { duration },
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}