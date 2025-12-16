import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const videoFile = formData.get("video") as File;
    const responseText = formData.get("responseText") as string;
    const interviewId = formData.get("interviewId") as string;
    const questionIndex = formData.get("questionIndex") as string;
    const questionText = formData.get("questionText") as string;
    const userId = formData.get("userId") as string;
    const duration = formData.get("duration") as string;

    if (!audioFile || !videoFile || !interviewId || !questionIndex || !questionText || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For now, we'll store the files in a simple way
    // In production, you might want to upload to AWS S3, Cloudinary, or similar
    const audioUrl = `/uploads/audio_${Date.now()}_${audioFile.name}`;
    const videoUrl = `/uploads/video_${Date.now()}_${videoFile.name}`;

    // In a real implementation, you would:
    // 1. Upload files to a storage service
    // 2. Get the public URLs
    // 3. Use Convex to save the response

    // For demo purposes, we'll just simulate the storage
    console.log("Recording received:", {
      audioFile: audioFile.name,
      videoFile: videoFile.name,
      responseText,
      interviewId,
      questionIndex,
      questionText,
      userId,
      duration
    });

    // In a real implementation, you would call your Convex mutation here:
    // const responseId = await convex.mutation(api.interview.saveInterviewResponse, {
    //   interviewId: interviewId as any,
    //   questionIndex: parseInt(questionIndex),
    //   questionText,
    //   responseText: responseText || null,
    //   audioUrl: publicAudioUrl,
    //   videoUrl: publicVideoUrl,
    //   userId: userId as any,
    //   duration: duration ? parseFloat(duration) : null,
    // });

    return NextResponse.json({
      success: true,
      message: "Response recorded successfully",
      audioUrl,
      videoUrl,
      // responseId,
    });

  } catch (error) {
    console.error("Recording error:", error);
    return NextResponse.json(
      { error: "Failed to record response" },
      { status: 500 }
    );
  }
}
