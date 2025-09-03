import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router";
import { ContributionForm } from "@/components/ContributionForm";
import { UserStats } from "@/components/UserStats";
import { ChallengeCard } from "@/components/ChallengeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BarChart3, Trophy, LogOut } from "lucide-react";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"contribute" | "stats" | "challenges">("contribute");
  
  const activeChallenges = useQuery(api.challenges.getActiveChallenges, {});
  const userChallenges = useQuery(api.challenges.getUserChallenges, {});

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handleContributionSuccess = () => {
    // Refresh data or show success message
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/logo.svg"
                alt="Logo"
                className="h-8 w-8 cursor-pointer"
                onClick={() => window.location.href = "/"}
              />
              <div>
                <h1 className="text-xl font-bold">Language Contribution Platform</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.name || "Contributor"}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-muted rounded-lg w-fit">
          <Button
            variant={activeTab === "contribute" ? "default" : "ghost"}
            onClick={() => setActiveTab("contribute")}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Contribute
          </Button>
          <Button
            variant={activeTab === "stats" ? "default" : "ghost"}
            onClick={() => setActiveTab("stats")}
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </Button>
          <Button
            variant={activeTab === "challenges" ? "default" : "ghost"}
            onClick={() => setActiveTab("challenges")}
            size="sm"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Challenges
          </Button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "contribute" && (
            <div className="space-y-8">
              <ContributionForm onSuccess={handleContributionSuccess} />
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-8">
              <UserStats />
            </div>
          )}

          {activeTab === "challenges" && (
            <div className="space-y-8">
              {/* Active Challenges */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Available Challenges</h2>
                {activeChallenges && activeChallenges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeChallenges.map((challenge) => (
                      <ChallengeCard
                        key={challenge._id}
                        challenge={challenge}
                        isJoined={false}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No active challenges at the moment</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* User's Challenges */}
              {userChallenges && userChallenges.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Your Challenges</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userChallenges.map((challenge) => (
                      <ChallengeCard
                        key={challenge._id}
                        challenge={challenge}
                        isJoined={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}