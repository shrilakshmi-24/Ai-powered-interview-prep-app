import { NextRequest, NextResponse } from 'next/server';
import ImageKit from "imagekit";
import { validateImageKitConfig } from '@/app/utils/imagekit';

export async function POST(request: NextRequest) {
  try {
    // Validate configuration
    validateImageKitConfig();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'interviews';
    
    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid file: file is empty or missing" },
        { status: 400 }
      );
    }
    
    // Initialize ImageKit with server-side credentials
    const ik = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
    });
    
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to ImageKit
    const response = await ik.upload({
      file: buffer,
      fileName: `${Date.now()}_${file.name}`,
      folder: folder,
      isPublished: true
    });
    
    return NextResponse.json({
      success: true,
      url: response.url,
      fileId: response.fileId,
      name: response.name,
      size: response.size
    });
    
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Upload failed" 
      },
      { status: 500 }
    );
  }
}
