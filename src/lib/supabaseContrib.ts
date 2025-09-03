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

export async function insertTextContribution({
  userEmail,
  language,
  content,
  wordCount,
  difficulty,
}: TextContribution) {
  // Resolve language_id via languages table
  let languageId: string | null = null;
  try {
    const { data: langRow } = await supabase
      .from("languages")
      .select("id")
      .eq("code", language)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    languageId = langRow?.id ?? null;
  } catch {
    languageId = null;
  }

  // Prefer writing to text_contributions using language_id
  try {
    const { error } = await supabase.from("text_contributions").insert({
      user_email: userEmail,
      language_id: languageId, // FK to languages.id
      // fallback if db still expects 'language' column present (will be ignored if not)
      language,
      content,
      is_validated: false,
      metadata: { wordCount, difficulty },
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
    return;
  } catch {
    // Fallback: if language_id column doesn't exist yet, insert using legacy 'language' column
    const { error } = await supabase.from("text_contributions").insert({
      user_email: userEmail,
      language,
      content,
      is_validated: false,
      metadata: { wordCount, difficulty },
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}

export async function insertVoiceContribution({
  userEmail,
  language,
  audioStorageId,
  duration,
}: VoiceContribution) {
  // Resolve language_id via languages table
  let languageId: string | null = null;
  try {
    const { data: langRow } = await supabase
      .from("languages")
      .select("id")
      .eq("code", language)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    languageId = langRow?.id ?? null;
  } catch {
    languageId = null;
  }

  // Prefer writing to audio_contributions using language_id
  try {
    const { error } = await supabase.from("audio_contributions").insert({
      user_email: userEmail,
      language_id: languageId, // FK to languages.id
      // fallback if db still expects 'language' column present (will be ignored if not)
      language,
      audio_storage_id: audioStorageId,
      is_validated: false,
      metadata: { duration },
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
    return;
  } catch {
    // Fallback: if language_id column doesn't exist yet, insert using legacy 'language' column
    const { error } = await supabase.from("audio_contributions").insert({
      user_email: userEmail,
      language,
      audio_storage_id: audioStorageId,
      is_validated: false,
      metadata: { duration },
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}