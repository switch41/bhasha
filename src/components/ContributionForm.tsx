import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getSupabaseClient } from "@/lib/supabase";
import { Image as ImageIcon } from "lucide-react";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Mic, Type, Send, Loader2 } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { motion } from "framer-motion";
import { insertTextContribution, insertVoiceContribution } from "@/lib/supabaseContrib";
import { insertImageContribution } from "@/lib/supabaseContrib";
import { useAuth } from "@/hooks/use-auth";

interface ContributionFormProps {
  onSuccess?: () => void;
}

export function ContributionForm({ onSuccess }: ContributionFormProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [contributionType, setContributionType] = useState<"text" | "voice" | "image">("text");
  const [textContent, setTextContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Array<BlobPart>>([]);
  const timerRef = useRef<number | null>(null);
  const { user } = useAuth();
  const userEmail = user?.email || "";
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageCaption, setImageCaption] = useState<string>("");

  async function uploadAudioToSupabase(audioBlob: Blob): Promise<string> {
    const sb = getSupabaseClient();
    const fileName = `audio_${Date.now()}.webm`;
    const path = `uploads/${fileName}`;
    const { error } = await sb.storage.from("audio").upload(path, audioBlob, {
      cacheControl: "3600",
      upsert: false,
      contentType: audioBlob.type || "audio/webm",
    });
    if (error) {
      const msg = String(error?.message || "Unknown error");
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("bucket")) {
        toast.error("Missing Storage bucket 'audio'. Create it in Supabase → Storage.");
      }
      throw new Error(`Audio upload failed: ${msg}`);
    }
    return path; // store path as audioStorageId
  }

  async function uploadTextToSupabase(text: string): Promise<string> {
    const sb = getSupabaseClient();
    const fileName = `text_${Date.now()}.txt`;
    const path = `uploads/${fileName}`;
    const textBlob = new Blob([text], { type: "text/plain;charset=utf-8" });
    // Change storage bucket from "text" to "text-contributions"
    const { error } = await sb.storage.from("text-contributions").upload(path, textBlob, {
      cacheControl: "3600",
      upsert: false,
      contentType: "text/plain",
    });
    if (error) {
      const msg = String(error?.message || "Unknown error");
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("bucket")) {
        // Update error hint to the correct bucket name
        toast.error("Missing Storage bucket 'text-contributions'. Create it in Supabase → Storage.");
      }
      throw new Error(`Text upload failed: ${msg}`);
    }
    return path; // store path as textStorageId
  }

  async function uploadImageToSupabase(file: File): Promise<{ path: string; size: number }> {
    const sb = getSupabaseClient();
    const fileName = `image_${Date.now()}_${file.name}`;
    const path = `uploads/${fileName}`;
    const { error } = await sb.storage.from("images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/*",
    });
    if (error) {
      const msg = String(error?.message || "Unknown error");
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("bucket")) {
        toast.error("Missing Storage bucket 'images'. Create it in Supabase → Storage.");
      }
      throw new Error(`Image upload failed: ${msg}`);
    }
    return { path, size: file.size };
  }

  const handleSubmit = async () => {
    if (!selectedLanguage) {
      toast.error("Please select a language");
      return;
    }

    setIsSubmitting(true);
    try {
      // Resolve email from Supabase Auth if local email is missing
      const sb = getSupabaseClient();
      let effectiveEmail = userEmail;
      try {
        const {
          data: { user: sbUser },
        } = await sb.auth.getUser();
        if (!effectiveEmail && sbUser?.email) {
          effectiveEmail = sbUser.email;
        }
        // Also fail fast if there is no Supabase session to satisfy RLS
        if (!sbUser?.id) {
          throw new Error("You must be signed in (Supabase) to submit a contribution.");
        }
      } catch (e: any) {
        throw new Error(e?.message || "You must be signed in (Supabase) to submit a contribution.");
      }

      if (contributionType === "text") {
        if (!textContent.trim()) {
          toast.error("Please enter text content");
          setIsSubmitting(false);
          return;
        }

        const wc = textContent.trim().split(/\s+/).length;
        const diff = textContent.length > 100 ? "medium" : "easy";

        // Optional: upload raw text to storage (not required by schema, but helpful for reference)
        const textStoragePath = await uploadTextToSupabase(textContent.trim());

        await insertTextContribution({
          userEmail: effectiveEmail,
          language: selectedLanguage as any,
          content: textContent.trim(),
          wordCount: wc,
          difficulty: diff,
          textStorageId: textStoragePath,
        });

        toast.success("Text contribution submitted!");
        setTextContent("");
      } else if (contributionType === "voice") {
        if (!audioBlob) {
          toast.error("Please record audio first");
          setIsSubmitting(false);
          return;
        }

        const storagePath = await uploadAudioToSupabase(audioBlob);

        await insertVoiceContribution({
          userEmail: effectiveEmail,
          language: selectedLanguage as any,
          audioStorageId: storagePath,
          duration: recordingDuration,
        });

        toast.success("Voice contribution submitted!");
        setAudioBlob(null);
        setAudioUrl("");
        setRecordingDuration(0);
      } else if (contributionType === "image") {
        if (!imageFile) {
          toast.error("Please select an image");
          setIsSubmitting(false);
          return;
        }

        const { path, size } = await uploadImageToSupabase(imageFile);

        await insertImageContribution({
          userEmail: effectiveEmail,
          language: selectedLanguage as any,
          filePath: path,
          caption: imageCaption || undefined,
          fileSize: size,
        });

        toast.success("Image contribution submitted!");
        setImageFile(null);
        setImagePreview("");
        setImageCaption("");
      }

      onSuccess?.();
    } catch (error: any) {
      // Improved error surface (RLS policy violations, bucket errors, etc.)
      const message =
        error?.message ||
        error?.error_description ||
        (typeof error === "string" ? error : "There was an error submitting your contribution. Please try again.");
      toast.error(message);
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceRecording = async () => {
    try {
      if (!isRecording) {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        chunksRef.current = [];
        mediaRecorderRef.current = mr;

        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          // stop all tracks
          stream.getTracks().forEach((t) => t.stop());
          // clear timer
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
        };

        // start duration timer
        setRecordingDuration(0);
        timerRef.current = window.setInterval(() => {
          setRecordingDuration((d) => d + 1);
        }, 1000);

        mr.start();
        setIsRecording(true);
        toast.info("Recording started");
      } else {
        // Stop recording
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        toast.info("Recording stopped");
      }
    } catch (e) {
      console.error(e);
      toast.error("Microphone permission denied or unavailable");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Type className="h-5 w-5" />
            Contribute to Language AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Select Language</label>
              {selectedLanguage ? (
                <Badge variant="secondary">
                  Selected: {selectedLanguage.toUpperCase()}
                </Badge>
              ) : null}
            </div>
            {/* Use the Select trigger directly as the interactive element */}
            <LanguageSelector
              value={selectedLanguage}
              onValueChange={(val) => setSelectedLanguage(val)}
              className="w-full"
            />
          </div>

          {/* Contribution Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Contribution Type</label>
            <div className="flex gap-2">
              <Button
                variant={contributionType === "text" ? "default" : "outline"}
                onClick={() => setContributionType("text")}
                className="flex-1"
              >
                <Type className="h-4 w-4 mr-2" />
                Text
              </Button>
              <Button
                variant={contributionType === "voice" ? "default" : "outline"}
                onClick={() => setContributionType("voice")}
                className="flex-1"
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice
              </Button>
              <Button
                variant={contributionType === "image" ? "default" : "outline"}
                onClick={() => setContributionType("image")}
                className="flex-1"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </Button>
            </div>
          </div>

          {/* Content Input */}
          {contributionType === "text" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Contribution</label>
              <Textarea
                placeholder="Enter text in your selected language..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="min-h-32 resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Characters: {textContent.length}</span>
                <span>Words: {textContent.trim() ? textContent.trim().split(/\s+/).length : 0}</span>
              </div>
            </div>
          )}

          {contributionType === "voice" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg w-full">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="lg"
                  onClick={handleVoiceRecording}
                  className="mb-4"
                  disabled={isSubmitting}
                >
                  <Mic className="h-5 w-5 mr-2" />
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
                <p className="text-sm text-muted-foreground text-center mb-2">
                  {isRecording
                    ? `Recording... ${recordingDuration}s`
                    : audioBlob
                      ? `Recorded ${Math.max(1, recordingDuration)}s`
                      : "Click to start recording your voice contribution"}
                </p>
                {audioUrl && (
                  <audio controls src={audioUrl} className="w-full max-w-md" />
                )}
              </div>
            </div>
          )}

          {contributionType === "image" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setImageFile(f || null);
                    setImagePreview(f ? URL.createObjectURL(f) : "");
                  }}
                  className="mb-4"
                  disabled={isSubmitting}
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="max-h-64 rounded-md border" />
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Select an image to contribute (jpg, png, etc.)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Caption (optional)</label>
                <Textarea
                  placeholder="Add a caption or context..."
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="min-h-24 resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !selectedLanguage ||
              (contributionType === "text" ? !textContent.trim() : contributionType === "voice" ? !audioBlob : !imageFile)
            }
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Contribution
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}