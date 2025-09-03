import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function LanguageSelector({ value, onValueChange, className }: LanguageSelectorProps) {
  const languages = useQuery(api.languages.getActiveLanguages);

  if (!languages) {
    return (
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading languages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <SelectValue placeholder="Select a language" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
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
