import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
  // Add controlled open props (optional)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LanguageSelector({ value, onValueChange, className, open, onOpenChange }: LanguageSelectorProps) {
  const languages = useQuery(api.languages.getActiveLanguages);

  if (!languages) {
    return (
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading languages...</span>
      </div>
    );
  }

  // Add fallback Indic languages when DB has no entries yet
  const fallbackLanguages = [
    { code: "hi", name: "Hindi", nativeName: "हिन्दी", totalContributions: 0 },
    { code: "bn", name: "Bengali", nativeName: "বাংলা", totalContributions: 0 },
    { code: "te", name: "Telugu", nativeName: "తెలుగు", totalContributions: 0 },
    { code: "mr", name: "Marathi", nativeName: "मराठी", totalContributions: 0 },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்", totalContributions: 0 },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", totalContributions: 0 },
    { code: "ur", name: "Urdu", nativeName: "اردو", totalContributions: 0 },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", totalContributions: 0 },
    { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", totalContributions: 0 },
    { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", totalContributions: 0 },
    { code: "ml", name: "Malayalam", nativeName: "മലയാളം", totalContributions: 0 },
    { code: "as", name: "Assamese", nativeName: "অসমীয়া", totalContributions: 0 },
  ];

  const list = languages.length > 0 ? languages : fallbackLanguages;

  return (
    <div className="space-y-2">
      {/* Use undefined when there is no value to show placeholder correctly and avoid empty-string control issues */}
      <Select value={value || undefined} onValueChange={onValueChange} open={open} onOpenChange={onOpenChange}>
        <SelectTrigger className={className}>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <SelectValue placeholder="Select an Indian language" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {list.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{language.name}</span>
                  <span className="text-sm text-muted-foreground">{language.nativeName}</span>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {language.totalContributions}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}