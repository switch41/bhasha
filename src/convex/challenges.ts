import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { languageValidator, contributionTypeValidator } from "./schema";

// Join a challenge
export const joinChallenge = mutation({
  args: {
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated to join challenges");
    }

    try {
      // Validate the challenge exists and is joinable
      const challenge = await ctx.db.get(args.challengeId);
      if (!challenge) {
        throw new Error("Challenge not found.");
      }
      const now = Date.now();
      if (!challenge.isActive || challenge.endDate <= now) {
        throw new Error("This challenge is not currently active.");
      }

      const existing = await ctx.db
        .query("challengeParticipations")
        .withIndex("by_user_and_challenge", (q) =>
          q.eq("userId", user._id).eq("challengeId", args.challengeId)
        )
        .unique();

      if (existing) {
        return existing._id;
      }

      return await ctx.db.insert("challengeParticipations", {
        userId: user._id,
        challengeId: args.challengeId,
        contributionsCount: 0,
        completed: false,
      });
    } catch (err) {
      console.error("challenges.joinChallenge failed", { args, err });
      throw new Error("Failed to join challenge. Please try again.");
    }
  },
});

// Get active challenges
export const getActiveChallenges = query({
  args: {
    language: v.optional(languageValidator),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("challenges")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    const challenges = await query.collect();

    if (args.language) {
      return challenges.filter(c => c.language === args.language);
    }

    return challenges;
  },
});

// Get user's challenge progress
export const getUserChallenges = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const participations = await ctx.db
      .query("challengeParticipations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const results: Array<{
      // doc fields from "challenges"
      _id: any;
      _creationTime: number;
      title: string;
      description: string;
      language: any;
      type: any;
      targetCount: number;
      startDate: number;
      endDate: number;
      isActive: boolean;
      prompt?: string;
      // additional
      progress: number;
      completed: boolean;
    }> = [];

    for (const participation of participations) {
      const challenge = await ctx.db.get(participation.challengeId);
      if (!challenge) continue;
      results.push({
        ...challenge,
        progress: participation.contributionsCount,
        completed: participation.completed,
      });
    }

    return results;
  },
});

// Create a new challenge (admin function)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    language: languageValidator,
    type: contributionTypeValidator,
    targetCount: v.number(),
    durationDays: v.number(),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create challenges");
    }

    const startDate = Date.now();
    const endDate = startDate + (args.durationDays * 24 * 60 * 60 * 1000);

    return await ctx.db.insert("challenges", {
      title: args.title,
      description: args.description,
      language: args.language,
      type: args.type,
      targetCount: args.targetCount,
      startDate,
      endDate,
      isActive: true,
      prompt: args.prompt,
    });
  },
});