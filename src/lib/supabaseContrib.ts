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

  // Prefer writing to text_contributions using language_id and explicit columns
  try {
    const { error } = await supabase.from("text_contributions").insert({
      user_email: userEmail,
      language_id: languageId, // FK to languages.id
      // fallback for legacy 'language' if present
      language,
      content,
      // explicit columns
      word_count: wordCount,
      difficulty,
      is_validated: false,
      // keep metadata for flexibility
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
      word_count: wordCount,
      difficulty,
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

  // Prefer writing to audio_contributions using language_id and explicit columns
  try {
    const { error } = await supabase.from("audio_contributions").insert({
      user_email: userEmail,
      language_id: languageId, // FK to languages.id
      // fallback for legacy 'language' if present
      language,
      audio_storage_id: audioStorageId,
      // explicit column
      duration,
      is_validated: false,
      // keep metadata for flexibility
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
      duration,
      is_validated: false,
      metadata: { duration },
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}