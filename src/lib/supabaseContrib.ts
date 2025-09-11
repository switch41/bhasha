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

type ImageContribution = {
  userEmail?: string;
  language: string;
  filePath: string;
  caption?: string;
  extractedText?: string;
  fileSize?: number;
  topic?: string | null;
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

    // Must use current Supabase auth user to satisfy RLS (auth.uid() = user_id)
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();
    if (authErr) throw authErr;
    if (!user?.id) throw new Error("You must be signed in to submit text.");

    const payload: Record<string, any> = {
      user_id: user.id,
      language_code: language,
      content,
      // Optional extras into metadata
      metadata: {
        wordCount,
        difficulty,
        text_storage_path: textStorageId,
        email: userEmail || user.email || null,
      },
      created_at: new Date().toISOString(),
    };

    const { error } = await sb.from("text_contributions").insert(payload);
    if (error) throw new Error(`Insert failed (text_contributions): ${formatSupabaseError(error)}`);
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
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();
    if (authErr) throw authErr;
    if (!user?.id) throw new Error("You must be signed in to submit audio.");

    const payload: Record<string, any> = {
      user_id: user.id,
      language_code: language,
      file_path: audioStorageId,
      duration_seconds: duration,
      is_processed: false,
      metadata: { duration, email: userEmail || user.email || null },
      created_at: new Date().toISOString(),
    };

    const { error } = await sb.from("audio_contributions").insert(payload);
    if (error) throw new Error(`Insert failed (audio_contributions): ${formatSupabaseError(error)}`);
  } catch (err) {
    throw new Error(`Voice contribution error: ${formatSupabaseError(err)}`);
  }
}

export async function insertImageContribution({
  userEmail,
  language,
  filePath,
  caption,
  extractedText,
  fileSize,
  topic,
}: ImageContribution) {
  if (!language) throw new Error("Missing language code");
  if (!filePath) throw new Error("Missing image file path");

  try {
    const sb = getSupabaseClient();
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();
    if (authErr) throw authErr;
    if (!user?.id) throw new Error("You must be signed in to submit an image.");

    const payload: Record<string, any> = {
      user_id: user.id,
      language_code: language,
      file_path: filePath,
      file_size: fileSize,
      caption: caption ?? null,
      extracted_text: extractedText ?? null,
      topic: topic ?? null,
      is_processed: false,
      metadata: { email: userEmail || user.email || null },
      created_at: new Date().toISOString(),
    };

    const { error } = await sb.from("image_contributions").insert(payload);
    if (error) throw new Error(`Insert failed (image_contributions): ${formatSupabaseError(error)}`);
  } catch (err) {
    throw new Error(`Image contribution error: ${formatSupabaseError(err)}`);
  }
}