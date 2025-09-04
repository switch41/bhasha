import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router";
import { ContributionForm } from "@/components/ContributionForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Plus, BarChart3, Trophy, LogOut } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const [activeTab] = useState<"contribute">("contribute");
  
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
    // Optionally refresh any Supabase-driven stats later
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
                onClick={() => (window.location.href = "/")}
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
        {/* Only Contribute */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="space-y-8">
            <ContributionForm onSuccess={handleContributionSuccess} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}