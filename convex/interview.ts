import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const saveInterviewQuestion = mutation({
  args: {
    userId: v.id("users"),
    questionText: v.any(),
    status: v.string(),
    resumeUrl: v.union(v.string(), v.null()),
    jobDescription: v.union(v.string(), v.null()),
    jobTitle: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const insertData: any = {
      userId: args.userId,
      questionText: args.questionText,
      status: args.status,
    };

    // Only include optional fields if they have values
    if (args.resumeUrl) {
      insertData.resumeUrl = args.resumeUrl;
    }
    if (args.jobDescription) {
      insertData.jobDescription = args.jobDescription;
    }
    if (args.jobTitle) {
      insertData.jobTitle = args.jobTitle;
    }

    const interviewQuestion = await ctx.db.insert("interviewQuestion", insertData);
    return interviewQuestion;
  },
});
