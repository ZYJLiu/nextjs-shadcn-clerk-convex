import { v } from "convex/values";
import { QueryCtx, mutation, query } from "./_generated/server";

export const store = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("code", { code: args.code });
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    return (await getCode(ctx)) || { code: "" };
  },
});

export async function getCode(ctx: QueryCtx) {
  return await ctx.db.query("code").first();
}
