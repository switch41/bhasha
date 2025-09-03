import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { languageValidator, contributionTypeValidator } from "./schema";

// Create a new contribution
export const create = mutation({
  args: {
    language: languageValidator,
    type: contributionTypeValidator,
    content: v.string(),
    audioFileId: v.optional(v.id("_storage")),
    metadata: v.optional(v.object({
      duration: v.optional(v.number()),
      wordCount: v.optional(v.number()),
      difficulty: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to contribute");
    }

    // Create the contribution
    const contributionId = await ctx.db.insert("contributions", {
      userId: user._id,
      language: args.language,
      type: args.type,
      content: args.content,
      audioFileId: args.audioFileId,
      isValidated: false,
      metadata: args.metadata,
    });

    // Update user's total contributions
    const currentContributions = user.totalContributions || 0;
    await ctx.db.patch(user._id, {
      totalContributions: currentContributions + 1,
      lastContributionDate: Date.now(),
    });

    // Update language metadata
    const languageData = await ctx.db
      .query("languageMetadata")
      .withIndex("by_code", (q) => q.eq("code", args.language))
      .unique();

    if (languageData) {
      await ctx.db.patch(languageData._id, {
        totalContributions: languageData.totalContributions + 1,
      });
    }

    return contributionId;
  },
});

// Get user's contributions
export const getUserContributions = query({
  args: {
    userId: v.optional(v.id("users")),
    language: v.optional(languageValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const userId = args.userId || user._id;
    
    let query = ctx.db
      .query("contributions")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.language) {
      query = ctx.db
        .query("contributions")
        .withIndex("by_user_and_language", (q) => 
          q.eq("userId", userId).eq("language", args.language as any)
        );
    }

    const contributions = await query
      .order("desc")
      .take(args.limit || 50);

    return contributions;
  },
});

// Get contributions by language
export const getByLanguage = query({
  args: {
    language: languageValidator,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contributions")
      .withIndex("by_language", (q) => q.eq("language", args.language))
      .order("desc")
      .take(args.limit || 20);
  },
});

// Get user statistics
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const languageBreakdown = contributions.reduce((acc, contrib) => {
      acc[contrib.language] = (acc[contrib.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeBreakdown = contributions.reduce((acc, contrib) => {
      acc[contrib.type] = (acc[contrib.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalContributions: contributions.length,
      languageBreakdown,
      typeBreakdown,
      weeklyStreak: user.weeklyStreak || 0,
      badges: user.badges || [],
    };
  },
});

// Validate a contribution (admin function)
export const validate = mutation({
  args: {
    contributionId: v.id("contributions"),
    isValid: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can validate contributions");
    }

    await ctx.db.patch(args.contributionId, {
      isValidated: args.isValid,
      validatedBy: user._id,
    });

    return args.contributionId;
  },
});