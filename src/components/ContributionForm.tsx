import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useMutation, useAction } from "convex/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Mic, Type, Send, Loader2 } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { motion } from "framer-motion";

interface ContributionFormProps {
  onSuccess?: () => void;
}

export function ContributionForm({ onSuccess }: ContributionFormProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [contributionType, setContributionType] = useState<"text" | "voice">("text");
  const [textContent, setTextContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Array<BlobPart>>([]);
  const timerRef = useRef<number | null>(null);

  const createContribution = useMutation(api.contributions.create);
  const generateUploadUrl = useAction(api.files.generateUploadUrl);

  const handleSubmit = async () => {
    if (!selectedLanguage) {
      toast.error("Please select a language");
      return;
    }

    setIsSubmitting(true);
    try {
      if (contributionType === "text") {
        if (!textContent.trim()) {
          toast.error("Please enter text content");
          setIsSubmitting(false);
          return;
        }

        await createContribution({
          language: selectedLanguage as any,
          type: contributionType,
          content: textContent.trim(),
          metadata: {
            wordCount: textContent.trim().split(/\s+/).length,
            difficulty: textContent.length > 100 ? "medium" : "easy",
          },
        });

        toast.success("Contribution submitted successfully!");
        setTextContent("");
      } else {
        // Voice
        if (!audioBlob) {
          toast.error("Please record audio first");
          setIsSubmitting(false);
          return;
        }

        // 1) Get signed upload URL
        const uploadUrl = await generateUploadUrl({});
        // 2) Upload the blob
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": audioBlob.type || "audio/webm" },
          body: audioBlob,
        });
        if (!res.ok) {
          throw new Error("Upload failed");
        }
        const { storageId } = await res.json();

        // 3) Save contribution
        await createContribution({
          language: selectedLanguage as any,
          type: "voice",
          content: "Voice contribution",
          audioFileId: storageId,
          metadata: { duration: recordingDuration },
        });

        toast.success("Voice contribution submitted!");
        // clear recording
        setAudioBlob(null);
        setAudioUrl("");
        setRecordingDuration(0);
      }

      onSuccess?.();
    } catch (error) {
      toast.error("Failed to submit contribution");
      console.error(error);
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

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !selectedLanguage ||
              (contributionType === "text" ? !textContent.trim() : !audioBlob)
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