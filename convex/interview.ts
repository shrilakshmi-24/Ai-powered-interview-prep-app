
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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


export const getInterviewById = query({
  args: {
    id: v.id("interviewQuestion"),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.id);
    return interview;
  },
});

export const saveInterviewResponse = mutation({
  args: {
    interviewId: v.id("interviewQuestion"),
    questionIndex: v.number(),
    questionText: v.string(),
    responseText: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    userId: v.id("users"),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const responseId = await ctx.db.insert("interviewResponses", {
      interviewId: args.interviewId,
      questionIndex: args.questionIndex,
      questionText: args.questionText,
      responseText: args.responseText,
      audioUrl: args.audioUrl,
      videoUrl: args.videoUrl,
      userId: args.userId,
      timestamp: Date.now(),
      duration: args.duration,
    });
    return responseId;
  },
});

export const getInterviewResponses = query({
  args: { interviewId: v.id("interviewQuestion") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviewResponses")
      .filter((q) => q.eq(q.field("interviewId"), args.interviewId))
      .order("asc")
      .collect();
  },
});


export const getNextQuestionIndex = query({
  args: { interviewId: v.id("interviewQuestion") },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("interviewResponses")
      .filter((q) => q.eq(q.field("interviewId"), args.interviewId))
      .collect();
    
    if (responses.length === 0) {
      return 0;
    }
    
    // Find the highest question index and return next one
    const maxIndex = Math.max(...responses.map(r => r.questionIndex));
    return maxIndex + 1;
  },
});

export const collectInterviewData = query({
  args: { interviewId: v.id("interviewQuestion") },
  handler: async (ctx, args) => {
    // Get the interview question
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    // Get all responses for this interview
    const responses = await ctx.db
      .query("interviewResponses")
      .filter((q) => q.eq(q.field("interviewId"), args.interviewId))
      .order("asc")
      .collect();

    // Format the data for the feedback API
    const questionsAndResponses = responses.map(response => ({
      question: response.questionText,
      response: response.responseText || ""
    }));

    return {
      interview: interview,
      questionsAndResponses: questionsAndResponses,
      totalQuestions: responses.length
    };
  },
});

export const saveInterviewFeedback = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const feedbackId = await ctx.db.insert("interviewFeedback", {
      interviewId: args.interviewId,
      userId: args.userId,
      feedback: args.feedback,
      knowledgeBasedRating: args.knowledgeBasedRating,
      suggestionsForImprovement: args.suggestionsForImprovement,
      overallScore: args.overallScore,
      questionsAndResponses: args.questionsAndResponses,
      createdAt: Date.now(),
    });
    return feedbackId;
  },
});


export const getInterviewFeedback = query({
  args: { interviewId: v.id("interviewQuestion") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviewFeedback")
      .filter((q) => q.eq(q.field("interviewId"), args.interviewId))
      .collect();
  },
});

export const getUserInterviews = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all interviews for the user
    const interviews = await ctx.db
      .query("interviewQuestion")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();

    // For each interview, get the response count and feedback
    const interviewsWithDetails = await Promise.all(
      interviews.map(async (interview) => {
        // Get response count
        const responses = await ctx.db
          .query("interviewResponses")
          .filter((q) => q.eq(q.field("interviewId"), interview._id))
          .collect();

        // Get feedback if any
        const feedback = await ctx.db
          .query("interviewFeedback")
          .filter((q) => q.eq(q.field("interviewId"), interview._id))
          .collect();

        return {
          ...interview,
          responseCount: responses.length,
          hasFeedback: feedback.length > 0,
          feedback: feedback.length > 0 ? feedback[0] : null
        };
      })
    );

    return interviewsWithDetails;
  },
});
