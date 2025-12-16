import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    const API_KEY = process.env.D_ID_API_KEY;

    if (!API_KEY) {
      return NextResponse.json({ error: "D-ID API key missing" }, { status: 500 });
    }

    const authHeader = "Basic " + Buffer.from(`${API_KEY}:`).toString("base64");

    console.log("Creating D-ID talk…");

    // STEP 1 — Create talk (video)
    const createTalk = await axios.post(
      "https://api.d-id.com/talks",
      {
        source_url:
          "https://ik.imagekit.io/jpvpldvpk/ik-genimg-prompt-create%20one%20image%20of%20the%20person%20who%20asks%20interview%20question%20like%20I%20want%20it%20for%20d-id%20image%20should%20be%20proffessional%0A/979a7f1a-288d-45ff-b4ba-fd97b84f5128/image.jpg?tr=f-jpg%2Ch-1024%2Cw-1024&ik-s=0ce00167294a3ee6385e547c43b713d2f9946217",
        script: {
          type: "text",
          input: text,
          subtitles: false,
        },
        config: {
          result_format: "mp4",
          fluent: true,
          stitch: true,
        },
      },
      { headers: { Authorization: authHeader } }
    );

    const talkId = createTalk.data.id;
    console.log("D-ID Talk ID:", talkId);

    // STEP 2 — Poll status until done
    async function pollStatus() {
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 2000)); // wait 2 sec

        const statusRes = await axios.get(
          `https://api.d-id.com/talks/${talkId}`,
          { headers: { Authorization: authHeader } }
        );

        const statusData = statusRes.data;

        console.log("Polling:", statusData.status);

        if (statusData.status === "done") {
          return {
            success: true,
            talkId,
            resultUrl: statusData.result_url,
            status: "completed",
          };
        }

        if (statusData.status === "error") {
          return {
            success: false,
            talkId,
            status: "error",
          };
        }
      }

      return {
        success: true,
        talkId,
        status: "processing",
      };
    }

    const finalResult = await pollStatus();
    return NextResponse.json(finalResult);
  } catch (error: any) {
    console.error("D-ID error:", error?.response?.data || error.message);
    return NextResponse.json(
      {
        error: "Failed to generate video",
        details: error?.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check talk status
export async function GET(request: NextRequest) {
  try {
    const talkId = new URL(request.url).searchParams.get("talkId");
    const API_KEY = process.env.D_ID_API_KEY;

    if (!talkId) return NextResponse.json({ error: "Talk ID missing" }, { status: 400 });
    if (!API_KEY) return NextResponse.json({ error: "D-ID API key missing" }, { status: 500 });

    const authHeader = "Basic " + Buffer.from(`${API_KEY}:`).toString("base64");

    const statusRes = await axios.get(
      `https://api.d-id.com/talks/${talkId}`,
      { headers: { Authorization: authHeader } }
    );

    const data = statusRes.data;

    return NextResponse.json({
      talkId,
      status: data.status,
      resultUrl: data.result_url,
      duration: data.duration,
      createdAt: data.created_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Status check failed",
        details: error?.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
