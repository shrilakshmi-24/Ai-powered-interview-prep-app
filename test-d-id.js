
// Test script to debug D-ID API integration

async function testDIdAPI() {
  const apiKey = process.env.D_ID_API_KEY;
  
  if (!apiKey) {
    console.log("❌ D_ID_API_KEY not found in environment variables");
    console.log("Please add D_ID_API_KEY to your .env.local file");
    return;
  }
  
  console.log("✅ D_ID_API_KEY found");
  
  // Test API connection
  try {
    const response = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        source_url: "https://create-images-results.d-id.com/image_12-12-2024_19-45-37/1c4f0b64-3e7d-43c2-ae43-2c94b5f1f1b0.png",
        script: {
          type: "text",
          subtitles: "false",

          provider: {
            type: "google",
            voice_id: "en-US-Studio-O",
            voice_config: {
              style: "0.5",
              rate: "1.0"
            }
          },
          input: "Hello, this is a test message.",
          config: {
            fluent: true,
            pad_audio: 0.0
          }
        },
        config: {
          result_format: "mp4",
          fluent: true,
          pad_audio: 0.0,
          stitch: true
        }
      }),
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ D-ID API call successful!");
      console.log("Talk ID:", data.id);
      console.log("Status:", data.status);
    } else {
      const errorText = await response.text();
      console.log("❌ D-ID API call failed:", errorText);
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
  }
}

// Run the test
testDIdAPI();
