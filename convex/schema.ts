import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.union(v.string(), v.null())), // nullable + optional
  }),

  interviewQuestion: defineTable({
    userId: v.id("users"),

    // questionText may be anything, including null
    questionText: v.union(v.any(), v.null()),

    status: v.string(),

    resumeUrl: v.optional(v.union(v.string(), v.null())),
    jobDescription: v.optional(v.union(v.string(), v.null())),
    jobTitle: v.optional(v.union(v.string(), v.null())),
  }),
});
