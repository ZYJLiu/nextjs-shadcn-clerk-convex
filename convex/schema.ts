import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    username: v.string(),
    pictureUrl: v.string(),
  }).index("byUserName", ["username"]),
  games: defineTable({
    userId: v.optional(v.id("users")),
    startTime: v.optional(v.number()),
    code: v.optional(v.string()),
    keystroke: v.optional(
      v.array(
        v.object({
          key: v.string(),
          timestamp: v.number(),
          index: v.number(),
          correct: v.boolean(),
        })
      )
    ),
  }).index("byUserId", ["userId"]),
  code: defineTable({
    code: v.string(),
  }),
});
