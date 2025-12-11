import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  }),

  interviewQuestion: defineTable({
    userId: v.id("users"),
    questionText: v.any(),
    status: v.string(),
    resumeUrl: v.string(),
  }),
});

