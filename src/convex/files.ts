import { action } from "./_generated/server";

// Returns a signed URL to upload a file directly to Convex Storage from the client.
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const url = await ctx.storage.generateUploadUrl();
    return url;
  },
});
