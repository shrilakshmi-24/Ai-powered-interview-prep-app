
import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, userId } = body;

    if (!interviewId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing interviewId or userId" },
        { status: 400 }
      );
    }

    // Collect all questions and responses for this interview
    const interviewData = await fetchQuery(api.interview.collectInterviewData, {
      interviewId: interviewId,
    });

    if (!interviewData) {
      return NextResponse.json(
        { success: false, error: "Interview data not found" },
        { status: 404 }
      );
    }

    // Prepare the data for the external feedback API as question-answer pairs
    const questionAnswerPairs = interviewData.questionsAndResponses.map(
      (qr: any) => ({
        question: qr.question,
        answer: qr.response || "",
      })
    );


    // Call the external feedback API with paired data
    const externalApiResponse = await fetch(
      "https://flows.pacewisdom.in/webhook/review",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response: JSON.stringify(questionAnswerPairs), // This is the REQUIRED format
        }),
      }
    );

    if (!externalApiResponse.ok) {
      throw new Error(
        `External API failed with status: ${externalApiResponse.status}`
      );
    }

    console.log("External API response status:", externalApiResponse);

    const feedbackResults = await externalApiResponse.json();


    // Return feedback data
    if (feedbackResults && feedbackResults.length > 0) {
      const feedback = feedbackResults[0]; // Take the first feedback result

      return NextResponse.json({
        success: true,
        feedback: feedback,
        totalQuestions: interviewData.totalQuestions,
        interviewId: interviewId,
        userId: userId,
      });
    } else {
      throw new Error("No feedback received from external API");
    }
  } catch (error) {
    console.error("Feedback processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process feedback",
      },
      { status: 500 }
    );
  }
}
