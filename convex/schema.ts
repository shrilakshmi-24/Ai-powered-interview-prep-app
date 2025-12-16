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


  interviewResponses: defineTable({
    interviewId: v.id("interviewQuestion"),
    questionIndex: v.number(),
    questionText: v.string(),
    responseText: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    userId: v.id("users"),
    timestamp: v.number(),
    duration: v.optional(v.number()), // Duration of response in seconds
  }),

  interviewFeedback: defineTable({
    interviewId: v.id("interviewQuestion"),
    userId: v.id("users"),
    feedback: v.string(),
    knowledgeBasedRating: v.string(),
    suggestionsForImprovement: v.array(v.string()),
    overallScore: v.number(),
    questionsAndResponses: v.array(v.object({
      question: v.string(),
      response: v.optional(v.string())
    })),
    createdAt: v.number(),
  }),
});

