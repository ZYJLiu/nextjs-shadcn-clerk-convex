import { v } from "convex/values";
import { QueryCtx, mutation, query } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }
    const user = await getUser(ctx, identity.nickname!);
    if (user !== null) {
      if (
        user.name !== identity.name ||
        user.username !== identity.nickname ||
        user.pictureUrl !== identity.pictureUrl
      ) {
        await ctx.db.patch(user._id, {
          name: identity.name,
          username: identity.nickname,
          pictureUrl: identity.pictureUrl,
        });
      }
      return user._id;
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: identity.name!,
      username: identity.nickname!,
      pictureUrl: identity.pictureUrl!,
    });
  },
});

export const get = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await getUser(ctx, args.username);
  },
});

export async function getUser(ctx: QueryCtx, username: string) {
  return await ctx.db
    .query("users")
    .withIndex("byUserName", (q) => q.eq("username", username))
    .unique();
}
