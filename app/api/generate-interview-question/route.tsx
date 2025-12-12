
import axios from "axios";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { aj } from "@/app/utils/arcjet";

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL || "",
});

export async function POST(request: NextRequest) {

  // Apply Arcjet protection
  const decision = await aj.protect(request, { requested: 1 });
  
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Interview limit exceeded. You can only take one interview per day. Please try again tomorrow." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Request blocked" },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const jobDescription = formData.get("jobDescription") as string;
  const jobTitle = formData.get("jobTitle") as string;

  try {
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      // Upload file to ImageKit
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${Date.now()}.pdf`,
        isPublished: true,
        folder: "/resumes/",
      });

      // Call n8n webhook
      const response = await axios.post(
        "https://flows.pacewisdom.in/webhook/interview-questions",
        { fileUrl: uploadResponse.url }
      );

      // IMPORTANT: return only data, NOT the full axios response
      return NextResponse.json({
        question: response.data,
        fileUrl: uploadResponse.url,
      });
    } else {
      // Call n8n webhook with job description and title
      const response = await axios.post(
        "https://flows.pacewisdom.in/webhook/interview-questions",
        { jobDescription, jobTitle }
      );



      return NextResponse.json({
        question: response.data,
        jobDescription, jobTitle 
      });
    }
  } catch (error) {
    console.error("Error uploading file to ImageKit:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
