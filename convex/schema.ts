import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    username: v.string(),
    pictureUrl: v.string(),
    numPosts: v.number(),
  }).index("byUserName", ["username"]),
});
