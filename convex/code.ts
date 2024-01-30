import { v } from "convex/values";
import { QueryCtx, mutation, query } from "./_generated/server";

export const store = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("code", { code: args.code });
  },
});

export const get = query({
  args: { random: v.float64() },
  handler: async (ctx, args) => {
    return (await getCode(ctx, args.random)) || { code: "" };
  },
});

export async function getCode(ctx: QueryCtx, random: number) {
  // Fetch all code entries
  const allEntries = await ctx.db.query("code").collect();

  // Check if there are any entries
  if (allEntries.length === 0) {
    return null; // or handle the empty array case as needed
  }

  // Scale the random number to the range of array indices
  const scaledRandom = random * allEntries.length;

  // Floor the scaled random number to get an index
  const randomIndex = Math.floor(scaledRandom);

  // Return the entry at the random index
  return allEntries[randomIndex] || { code: "" };
}
