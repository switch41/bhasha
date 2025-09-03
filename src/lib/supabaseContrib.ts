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
  const { error } = await supabase.from("contributions").insert({
    user_email: userEmail,
    language,
    type: "text",
    content,
    audio_storage_id: null,
    is_validated: false,
    metadata: {
      wordCount,
      difficulty,
    },
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
  const { error } = await supabase.from("contributions").insert({
    user_email: userEmail,
    language,
    type: "voice",
    content: "Voice contribution",
    audio_storage_id: audioStorageId,
    is_validated: false,
    metadata: {
      duration,
    },
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}
