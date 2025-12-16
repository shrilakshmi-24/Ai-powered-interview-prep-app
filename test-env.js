
// Test script to check environment variables

console.log("Environment variables check:");
console.log("D_ID_API_KEY:", process.env.D_ID_API_KEY ? "✅ Found" : "❌ Not found");
console.log("All env vars starting with D_ID:", Object.keys(process.env).filter(key => key.startsWith('D_ID')));
console.log("All env vars starting with DID:", Object.keys(process.env).filter(key => key.startsWith('DID')));

// Also check other common names
console.log("Variables containing 'did':", Object.keys(process.env).filter(key => key.toLowerCase().includes('did')));
console.log("Variables containing 'api':", Object.keys(process.env).filter(key => key.toLowerCase().includes('api')));
