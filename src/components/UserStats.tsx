import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Trophy, Target, Calendar, Languages } from "lucide-react";
import { motion } from "framer-motion";

export function UserStats() {
  const stats = useQuery(api.contributions.getUserStats);

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading stats...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const languageNames: Record<string, string> = {
    hi: "Hindi",
    bn: "Bengali",
    te: "Telugu",
    mr: "Marathi",
    ta: "Tamil",
    gu: "Gujarati",
    ur: "Urdu",
    kn: "Kannada",
    or: "Odia",
    pa: "Punjabi",
    ml: "Malayalam",
    as: "Assamese",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalContributions}</p>
                <p className="text-sm text-muted-foreground">Total Contributions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.weeklyStreak}</p>
                <p className="text-sm text-muted-foreground">Week Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Languages className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(stats.languageBreakdown).length}</p>
                <p className="text-sm text-muted-foreground">Languages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Breakdown */}
      {Object.keys(stats.languageBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Language Contributions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.languageBreakdown).map(([lang, count]) => {
              const percentage = (count / stats.totalContributions) * 100;
              return (
                <div key={lang} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {languageNames[lang] || lang}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {stats.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.badges.map((badge, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
