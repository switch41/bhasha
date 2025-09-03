import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// Language codes for Indian languages
export const LANGUAGES = {
  HINDI: "hi",
  BENGALI: "bn", 
  TELUGU: "te",
  MARATHI: "mr",
  TAMIL: "ta",
  GUJARATI: "gu",
  URDU: "ur",
  KANNADA: "kn",
  ODIA: "or",
  PUNJABI: "pa",
  MALAYALAM: "ml",
  ASSAMESE: "as",
} as const;

export const languageValidator = v.union(
  v.literal(LANGUAGES.HINDI),
  v.literal(LANGUAGES.BENGALI),
  v.literal(LANGUAGES.TELUGU),
  v.literal(LANGUAGES.MARATHI),
  v.literal(LANGUAGES.TAMIL),
  v.literal(LANGUAGES.GUJARATI),
  v.literal(LANGUAGES.URDU),
  v.literal(LANGUAGES.KANNADA),
  v.literal(LANGUAGES.ODIA),
  v.literal(LANGUAGES.PUNJABI),
  v.literal(LANGUAGES.MALAYALAM),
  v.literal(LANGUAGES.ASSAMESE),
);

export type Language = Infer<typeof languageValidator>;

export const contributionTypeValidator = v.union(
  v.literal("text"),
  v.literal("voice")
);

export type ContributionType = Infer<typeof contributionTypeValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      
      // Additional fields for language contribution platform
      preferredLanguage: v.optional(languageValidator),
      totalContributions: v.optional(v.number()),
      badges: v.optional(v.array(v.string())),
      weeklyStreak: v.optional(v.number()),
      lastContributionDate: v.optional(v.number()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Language contributions table
    contributions: defineTable({
      userId: v.id("users"),
      language: languageValidator,
      type: contributionTypeValidator,
      content: v.string(), // text content or audio file reference
      audioFileId: v.optional(v.id("_storage")), // for voice contributions
      isValidated: v.optional(v.boolean()),
      validatedBy: v.optional(v.id("users")),
      metadata: v.optional(v.object({
        duration: v.optional(v.number()), // for audio
        wordCount: v.optional(v.number()), // for text
        difficulty: v.optional(v.string()),
      })),
    })
    .index("by_user", ["userId"])
    .index("by_language", ["language"])
    .index("by_type", ["type"])
    .index("by_user_and_language", ["userId", "language"]),

    // Text contributions (separate table)
    textContributions: defineTable({
      userId: v.id("users"),
      language: languageValidator,
      content: v.string(),
      isValidated: v.optional(v.boolean()),
      validatedBy: v.optional(v.id("users")),
      metadata: v.optional(
        v.object({
          wordCount: v.optional(v.number()),
          difficulty: v.optional(v.string()),
        })
      ),
    })
      .index("by_user", ["userId"])
      .index("by_language", ["language"])
      .index("by_user_and_language", ["userId", "language"]),

    // Audio contributions (separate table)
    audioContributions: defineTable({
      userId: v.id("users"),
      language: languageValidator,
      audioFileId: v.id("_storage"),
      transcript: v.optional(v.string()),
      isValidated: v.optional(v.boolean()),
      validatedBy: v.optional(v.id("users")),
      metadata: v.optional(
        v.object({
          duration: v.optional(v.number()),
          difficulty: v.optional(v.string()),
        })
      ),
    })
      .index("by_user", ["userId"])
      .index("by_language", ["language"])
      .index("by_user_and_language", ["userId", "language"]),

    // Weekly challenges
    challenges: defineTable({
      title: v.string(),
      description: v.string(),
      language: languageValidator,
      type: contributionTypeValidator,
      targetCount: v.number(),
      startDate: v.number(),
      endDate: v.number(),
      isActive: v.boolean(),
      prompt: v.optional(v.string()),
    })
    .index("by_active", ["isActive"])
    .index("by_language", ["language"]),

    // User challenge participation
    challengeParticipations: defineTable({
      userId: v.id("users"),
      challengeId: v.id("challenges"),
      contributionsCount: v.number(),
      completed: v.boolean(),
    })
    .index("by_user", ["userId"])
    .index("by_challenge", ["challengeId"])
    .index("by_user_and_challenge", ["userId", "challengeId"]),

    // Language metadata
    languageMetadata: defineTable({
      code: languageValidator,
      name: v.string(),
      nativeName: v.string(),
      totalContributions: v.number(),
      activeContributors: v.number(),
      isActive: v.boolean(),
    })
    .index("by_code", ["code"])
    .index("by_active", ["isActive"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;