import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const saveInterviewQuestion = mutation({
  args: {
    userId: v.id("users"),
    questionText: v.any(),
    status: v.string(),
    resumeUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const interviewQuestion = await ctx.db.insert("interviewQuestion", {
      userId: args.userId,
      questionText: args.questionText,
      status: args.status,
      resumeUrl: args.resumeUrl,
    });
    return interviewQuestion;
  },
});
