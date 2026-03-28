import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(API_KEY);

export const processIntent = async (input, images = [], location = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are an AI-powered Universal Intent Translator designed for PromptWars.
      INPUT: "${input}"
      CONTEXT: ${location ? `Location: ${location}` : "Unknown Location"}
      FOLLOW THE 7-STEP PROCESS (Intent, Domain, JSON Data, Risk Level, 3+ Actions, Tone, Format).
      Format exactly as requested:
      🔍 Interpreted Intent:
      📊 Structured Data: (Valid JSON only)
      ⚠️ Risk Level: (low/medium/high/critical + reason)
      ✅ Recommended Actions: (min 3)
      🧠 Additional Insights:
    `;
    const parts = [{ text: prompt }];
    for (const img of images) {
      parts.push({ inlineData: { data: img.split(',')[1], mimeType: "image/jpeg" } });
    }
    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
