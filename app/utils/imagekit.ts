// ImageKit configuration for server-side use only
// This file should NOT be imported by client components

// ImageKit configuration
export const imagekitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
};

// Validate ImageKit configuration
export function validateImageKitConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY',
    'IMAGEKIT_PRIVATE_KEY',
    'NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Validate that keys are not empty strings
  if (!imagekitConfig.publicKey || !imagekitConfig.privateKey || !imagekitConfig.urlEndpoint) {
    throw new Error("ImageKit configuration values cannot be empty");
  }
}
