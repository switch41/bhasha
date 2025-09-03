import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Target, Calendar, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { Id } from "@/convex/_generated/dataModel";

interface Challenge {
  _id: Id<"challenges">;
  title: string;
  description: string;
  language: string;
  type: string;
  targetCount: number;
  startDate: number;
  endDate: number;
  progress?: number;
  completed?: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
  isJoined?: boolean;
}

export function ChallengeCard({ challenge, isJoined = false }: ChallengeCardProps) {
  const joinChallenge = useMutation(api.challenges.joinChallenge);

  const handleJoin = async () => {
    try {
      await joinChallenge({ challengeId: challenge._id as any });
      toast.success("Joined challenge successfully!");
    } catch (error) {
      toast.error("Failed to join challenge");
    }
  };

  const progress = challenge.progress || 0;
  const progressPercentage = (progress / challenge.targetCount) * 100;
  const daysLeft = Math.ceil((challenge.endDate - Date.now()) / (1000 * 60 * 60 * 24));

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${challenge.completed ? 'border-green-200 bg-green-50/50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {languageNames[challenge.language] || challenge.language}
                </Badge>
                <Badge variant="secondary">
                  {challenge.type}
                </Badge>
                {challenge.completed && (
                  <Badge variant="default" className="bg-green-600">
                    <Trophy className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
          
          {isJoined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Progress</span>
                <span className="font-medium">
                  {progress} / {challenge.targetCount}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Target: {challenge.targetCount} contributions
            </div>
            
            {!isJoined && daysLeft > 0 && (
              <Button onClick={handleJoin} size="sm">
                Join Challenge
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}