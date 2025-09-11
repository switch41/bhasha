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

    // Try to get the active Supabase session user for strict RLS (auth.uid())
    let effectiveEmail = userEmail;
    let supabaseUserId: string | undefined;
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user?.email && !effectiveEmail) effectiveEmail = user.email;
      if (user?.id) supabaseUserId = user.id;
    } catch {
      // ignore if no auth session
    }

    if (!effectiveEmail) throw new Error("Missing user email");

    const languageId = await getOrCreateLanguageId(language);

    // STRICT schema attempt (requires Supabase Auth session + columns user_id, language_code)
    // If your table enforces auth.uid() = user_id via RLS, this will pass.
    if (supabaseUserId) {
      const strictPayload: Record<string, any> = {
        user_id: supabaseUserId,
        language_code: language,
        content,
        word_count: wordCount,
        difficulty,
        is_validated: false,
        // Keep metadata rich
        metadata: {
          wordCount,
          difficulty,
          text_storage_id: textStorageId,
          supabase_user_id: supabaseUserId,
          email: effectiveEmail,
        },
        created_at: new Date().toISOString(),
      };

      const strictRes = await sb.from("text_contributions").insert(strictPayload);
      if (!strictRes.error) {
        return;
      }
      // If strict fails due to missing columns or different schema, fall through to legacy
      // but only if the error looks like a column issue or not-null/RLS mismatch
      // Otherwise propagate the specific error
      const msg = formatSupabaseError(strictRes.error);
      const maybeSchemaMismatch =
        msg.toLowerCase().includes("column") ||
        msg.toLowerCase().includes("does not exist") ||
        msg.toLowerCase().includes("null value") ||
        msg.toLowerCase().includes("violates row-level security") ||
        msg.toLowerCase().includes("new row violates");
      if (!maybeSchemaMismatch) {
        throw new Error(`Insert failed (text_contributions strict): ${msg}`);
      }
    }

    // LEGACY schema (user_email + language_id + language) fallback
    const { error: legacyErr } = await sb.from("text_contributions").insert({
      user_email: effectiveEmail,
      language_id: languageId,
      language,
      content,
      word_count: wordCount,
      difficulty,
      is_validated: false,
      metadata: { wordCount, difficulty, text_storage_id: textStorageId, supabase_user_id: supabaseUserId },
      created_at: new Date().toISOString(),
    });

    if (legacyErr) {
      throw new Error(`Insert failed (text_contributions legacy): ${formatSupabaseError(legacyErr)}`);
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

    // Try to get the active Supabase session user for strict RLS (auth.uid())
    let effectiveEmail = userEmail;
    let supabaseUserId: string | undefined;
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user?.email && !effectiveEmail) effectiveEmail = user.email;
      if (user?.id) supabaseUserId = user.id;
    } catch {
      // ignore if no auth session
    }
    if (!effectiveEmail) throw new Error("Missing user email");

    const languageId = await getOrCreateLanguageId(language);

    // STRICT schema attempt (user_id + language_code + audio_path)
    if (supabaseUserId) {
      const strictPayload: Record<string, any> = {
        user_id: supabaseUserId,
        language_code: language,
        audio_path: audioStorageId, // if your schema uses file/path column
        duration,
        is_validated: false,
        metadata: { duration, supabase_user_id: supabaseUserId, email: effectiveEmail },
        created_at: new Date().toISOString(),
      };

      const strictRes = await sb.from("audio_contributions").insert(strictPayload);
      if (!strictRes.error) {
        return;
      }
      const msg = formatSupabaseError(strictRes.error);
      const maybeSchemaMismatch =
        msg.toLowerCase().includes("column") ||
        msg.toLowerCase().includes("does not exist") ||
        msg.toLowerCase().includes("null value") ||
        msg.toLowerCase().includes("violates row-level security") ||
        msg.toLowerCase().includes("new row violates");
      if (!maybeSchemaMismatch) {
        throw new Error(`Insert failed (audio_contributions strict): ${msg}`);
      }
    }

    // LEGACY schema fallback (user_email + language_id + language + audio_storage_id)
    const { error } = await sb.from("audio_contributions").insert({
      user_email: effectiveEmail,
      language_id: languageId,
      language,
      audio_storage_id: audioStorageId,
      duration,
      is_validated: false,
      metadata: { duration, supabase_user_id: supabaseUserId },
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Insert failed (audio_contributions legacy): ${formatSupabaseError(error)}`);
    }
  } catch (err) {
    throw new Error(`Voice contribution error: ${formatSupabaseError(err)}`);
  }
}