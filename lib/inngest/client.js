import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "risk-wise", // Unique app ID
  name: "Risk Wise",
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 2,
  }),
});