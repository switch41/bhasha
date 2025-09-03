import { action } from "./_generated/server";

// Returns a signed URL to upload a file directly to Convex Storage from the client.
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    // Add error handling with logging and rethrow for visibility
    try {
      const url = await ctx.storage.generateUploadUrl();
      return url;
    } catch (err) {
      console.error("files.generateUploadUrl failed", err);
      throw new Error("Unable to generate upload URL. Please try again.");
    }
  },
});