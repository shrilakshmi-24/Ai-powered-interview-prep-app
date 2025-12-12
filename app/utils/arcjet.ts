

import arcjet, { detectBot, tokenBucket } from "@arcjet/next";

// Create an Arcjet instance with multiple rules
export const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      refillRate: 1, // refill 1 token per interval
      interval: 86400, // refill every 24 hours (86400 seconds)
      capacity: 1, // bucket maximum capacity of 1 token - allows only 1 interview per 24 hours
    }),
    detectBot({
      mode: "LIVE",
      allow: [], // "allow none" will block all detected bots
    }),
  ],
});
