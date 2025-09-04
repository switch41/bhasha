import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { 
  Globe, 
  Users, 
  Target, 
  ArrowRight, 
  Languages, 
  Mic, 
  Type,
  Trophy,
  BarChart3
} from "lucide-react";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const [languages, setLanguages] = useState<
    Array<{ code: string; name: string; nativeName: string; totalContributions: number }>
  >();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sb = getSupabaseClient();
        const { data, error } = await sb
          .from("languages")
          .select("code,name,native_name,total_contributions,is_active")
          .eq("is_active", true);
        if (error) throw error;

        if (!cancelled) {
          const mapped =
            data?.map((r: any) => ({
              code: r.code,
              name: r.name,
              nativeName: r.native_name,
              totalContributions: r.total_contributions ?? 0,
            })) ?? [];
          setLanguages(mapped);
        }
      } catch (e) {
        console.warn("Failed to load languages on Landing.", e);
        setLanguages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalContributions = languages?.reduce((sum, lang) => sum + lang.totalContributions, 0) || 0;
  const activeLanguages = languages?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold">LangContrib</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Button asChild>
                  <a href="/dashboard">
                    Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              ) : (
                <Button asChild>
                  <a href="/auth">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Badge variant="outline" className="px-4 py-2">
              <Globe className="h-4 w-4 mr-2" />
              Building AI for Indian Languages
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Contribute to the Future of
              <span className="text-primary block">Multilingual AI</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Help build better AI models by contributing text and voice data in your native Indian language. 
              Every contribution makes AI more inclusive and accessible.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <a href={isAuthenticated ? "/dashboard" : "/auth"}>
                {isAuthenticated ? "Go to Dashboard" : "Start Contributing"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <Card>
              <CardContent className="p-8 text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{totalContributions.toLocaleString()}</h3>
                <p className="text-muted-foreground">Total Contributions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <Languages className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{activeLanguages}</h3>
                <p className="text-muted-foreground">Indian Languages</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold mb-2">1,000+</h3>
                <p className="text-muted-foreground">Active Contributors</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How You Can Contribute</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Multiple ways to help build better AI models for Indian languages
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="h-full">
                <CardContent className="p-8">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mb-6">
                    <Type className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Text Contributions</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Share sentences, phrases, or paragraphs in your native language. 
                    Help AI understand the nuances and context of Indian languages.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Write in your native script
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Include cultural context
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Earn contribution badges
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="h-full">
                <CardContent className="p-8">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mb-6">
                    <Mic className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Voice Contributions</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Record your voice speaking in Indian languages. Help AI learn 
                    pronunciation, accents, and regional variations.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Record natural speech
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Include regional accents
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      Coming soon
                      <Badge variant="secondary" className="ml-1">Beta</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      {languages && languages.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Supported Languages</h2>
              <p className="text-muted-foreground">
                Contribute in any of these Indian languages
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {languages.map((language, index) => (
                <motion.div
                  key={language.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1">{language.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{language.nativeName}</p>
                      <Badge variant="secondary" className="text-xs">
                        {language.totalContributions}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-8"
          >
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            
            <h2 className="text-4xl font-bold">Ready to Make an Impact?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of contributors helping build more inclusive AI. 
              Your language matters, your voice counts.
            </p>
            
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <a href={isAuthenticated ? "/dashboard" : "/auth"}>
                {isAuthenticated ? "Continue Contributing" : "Start Your Journey"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
            <span className="font-semibold">LangContrib</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Building the future of multilingual AI, one contribution at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}