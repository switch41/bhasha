import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { languageValidator } from "./schema";

// Get all active languages
export const getActiveLanguages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("languageMetadata")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Get language statistics
export const getLanguageStats = query({
  args: {
    language: v.optional(languageValidator),
  },
  handler: async (ctx, args) => {
    if (args.language) {
      return await ctx.db
        .query("languageMetadata")
        .withIndex("by_code", (q) => q.eq("code", args.language as any))
        .unique();
    }

    return await ctx.db
      .query("languageMetadata")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Initialize language metadata (admin function)
export const initializeLanguages = mutation({
  args: {},
  handler: async (ctx) => {
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
          totalContributions: 0,
          activeContributors: 0,
          isActive: true,
        });
      }
    }

    return "Languages initialized";
  },
});