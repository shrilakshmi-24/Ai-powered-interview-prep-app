import axios from "axios";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL,
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
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
  } catch (error) {
    console.error("Error uploading file to ImageKit:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
