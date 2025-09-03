import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
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

  const createContribution = useMutation(api.contributions.create);

  const handleSubmit = async () => {
    if (!selectedLanguage || !textContent.trim()) {
      toast.error("Please select a language and enter content");
      return;
    }

    setIsSubmitting(true);
    try {
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
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to submit contribution");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceRecording = () => {
    // Voice recording functionality would be implemented here
    setIsRecording(!isRecording);
    toast.info("Voice recording feature coming soon!");
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
            <label className="text-sm font-medium">Select Language</label>
            <LanguageSelector
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
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
                disabled
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice
                <Badge variant="secondary" className="ml-2">Soon</Badge>
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
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="lg"
                  onClick={handleVoiceRecording}
                  className="mb-4"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Voice recording feature coming soon
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedLanguage || !textContent.trim() || isSubmitting}
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
