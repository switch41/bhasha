import { mutation } from "./_generated/server";

export const initializeApp = mutation({
  args: {},
  handler: async (ctx) => {
    // Initialize languages
    const languages = [
      { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
      { code: "bn", name: "Bengali", nativeName: "বাংলা" },
      { code: "te", name: "Telugu", nativeName: "తెలుగు" },
      { code: "mr", name: "Marathi", nativeName: "मराठी" },
      { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
      { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
      { code: "ur", name: "Urdu", nativeName: "اردو" },
      { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
      { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
      { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
      { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
      { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
    ];

    for (const lang of languages) {
      const existing = await ctx.db
        .query("languageMetadata")
        .withIndex("by_code", (q) => q.eq("code", lang.code as any))
        .unique();

      if (!existing) {
        await ctx.db.insert("languageMetadata", {
          code: lang.code as any,
          name: lang.name,
          nativeName: lang.nativeName,
          totalContributions: Math.floor(Math.random() * 500) + 50,
          activeContributors: Math.floor(Math.random() * 100) + 10,
          isActive: true,
        });
      }
    }

    // Create sample challenges
    const sampleChallenges = [
      {
        title: "Hindi Text Marathon",
        description: "Contribute 50 Hindi sentences to help improve AI understanding of Hindi grammar and vocabulary.",
        language: "hi" as any,
        type: "text" as any,
        targetCount: 50,
        startDate: Date.now(),
        endDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
        prompt: "Write sentences about daily life, culture, or technology in Hindi.",
      },
      {
        title: "Bengali Poetry Challenge",
        description: "Share beautiful Bengali phrases and poetry to enrich AI's understanding of Bengali literature.",
        language: "bn" as any,
        type: "text" as any,
        targetCount: 30,
        startDate: Date.now(),
        endDate: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days
        isActive: true,
        prompt: "Share Bengali poetry, proverbs, or literary expressions.",
      },
    ];

    for (const challenge of sampleChallenges) {
      const existing = await ctx.db
        .query("challenges")
        .filter((q) => q.eq(q.field("title"), challenge.title))
        .first();

      if (!existing) {
        await ctx.db.insert("challenges", challenge);
      }
    }

    return "App initialized successfully";
  },
});
