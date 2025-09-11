import { getSupabaseClient } from "@/lib/supabase";

type TextContribution = {
  userEmail: string;
  language: string;
  content: string;
  wordCount?: number;
  difficulty?: string;
  textStorageId?: string;
};

type VoiceContribution = {
  userEmail: string;
  language: string;
  audioStorageId: string; // Convex storage id for now
  duration?: number;
};

function formatSupabaseError(e: any): string {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  if (e?.message) return e.message;
  if (e?.error_description) return e.error_description;
  if (e?.hint) return e.hint;
  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}

async function getOrCreateLanguageId(code: string): Promise<string> {
  try {
    // Lazily resolve Supabase client at call time
    const sb = getSupabaseClient();

    // 1) Try to find by code (ignore is_active to be lenient)
    const { data: langRow, error: selErr } = await sb
      .from("languages")
      .select("id")
      .eq("code", code)
      .limit(1)
      .maybeSingle();

    if (selErr) {
      throw new Error(`Failed fetching language '${code}': ${formatSupabaseError(selErr)}`);
    }
    if (langRow?.id) return langRow.id;

    // 2) Insert minimal language if missing (safe default names)
    const { data: inserted, error: insErr } = await sb
      .from("languages")
      .insert({
        code,
        name: code.toUpperCase(),
        native_name: code,
        is_active: true,
      })
      .select("id")
      .single();

    if (insErr) {
      throw new Error(`Failed creating language '${code}': ${formatSupabaseError(insErr)}`);
    }
    return inserted.id;
  } catch (err) {
    throw new Error(`Language resolution error for '${code}': ${formatSupabaseError(err)}`);
  }
}

export async function insertTextContribution({
  userEmail,
  language,
  content,
  wordCount,
  difficulty,
  textStorageId,
}: TextContribution) {
  if (!language) throw new Error("Missing language code");
  if (!content?.trim()) throw new Error("Text content cannot be empty");

  try {
    const sb = getSupabaseClient();
    // Prefer Supabase Auth user if present
    let email = userEmail;
    let supabaseUserId: string | undefined;
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user?.email && !email) email = user.email;
      if (user?.id) supabaseUserId = user.id;
    } catch {
      // ignore if no auth session
    }
    if (!email) throw new Error("Missing user email");

    const languageId = await getOrCreateLanguageId(language);

    const { error } = await sb.from("text_contributions").insert({
      user_email: email,
      language_id: languageId,
      language,
      content,
      word_count: wordCount,
      difficulty,
      is_validated: false,
      metadata: { wordCount, difficulty, text_storage_id: textStorageId, supabase_user_id: supabaseUserId },
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Insert failed (text_contributions): ${formatSupabaseError(error)}`);
    }
  } catch (err) {
    throw new Error(`Text contribution error: ${formatSupabaseError(err)}`);
  }
}

export async function insertVoiceContribution({
  userEmail,
  language,
  audioStorageId,
  duration,
}: VoiceContribution) {
  if (!language) throw new Error("Missing language code");
  if (!audioStorageId) throw new Error("Missing audio storage id");

  try {
    const sb = getSupabaseClient();
    // Prefer Supabase Auth user if present
    let email = userEmail;
    let supabaseUserId: string | undefined;
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user?.email && !email) email = user.email;
      if (user?.id) supabaseUserId = user.id;
    } catch {
      // ignore if no auth session
    }
    if (!email) throw new Error("Missing user email");

    const languageId = await getOrCreateLanguageId(language);

    const { error } = await sb.from("audio_contributions").insert({
      user_email: email,
      language_id: languageId,
      language,
      audio_storage_id: audioStorageId,
      duration,
      is_validated: false,
      metadata: { duration, supabase_user_id: supabaseUserId },
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Insert failed (audio_contributions): ${formatSupabaseError(error)}`);
    }
  } catch (err) {
    throw new Error(`Voice contribution error: ${formatSupabaseError(err)}`);
  }
}