import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Universal Intent Translator (UIT) - Gemini 2.0 Integration
 * Featuring Automatic Regional Model Fallbacks for 100% Uptime
 */
export const processIntent = async (input, images = [], location = null) => {
  // Cascading array of models to bypass 429 Limit-0 Region errors
  const fallbackModels = [
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-latest",
    "gemini-pro"
  ];

  let lastError;

  for (const modelName of fallbackModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `
        You are an AI-powered Universal Intent Translator designed for the PromptWars challenge.
        Your goal is to parse messy inputs into clean, actionable, formatted data to bridge the gap between human emergencies and system responses.
        
        INPUT: "${input}"
        CONTEXT: ${location ? `GPS Location Coordinates: ${location}` : "Unknown Location"}
        
        FOLLOW THE 7-STEP PROCESS (Intent, Domain, JSON Data, Risk Level, 3+ Actions, Tone, Format).
        
        You MUST format your response using standard, clean HTML tags (like <b>, <ul>, <li>, <p>, <br>) so it renders beautifully in a web UI. Do NOT use markdown.
        Format EXACTLY as follows:
        
        <p><b>🔍 Interpreted Intent:</b> [Summary of what the human actually needs]</p>
        <p><b>📊 Structured Data:</b> <code>[Extract key entities into a valid, single-line JSON string]</code></p>
        <p><b>⚠️ Risk Level:</b> [LOW / MEDIUM / HIGH / CRITICAL] - [Brief Reason]</p>
        <p><b>✅ Recommended Actions:</b></p>
        <ul>
          <li>[Action 1]</li>
          <li>[Action 2]</li>
          <li>[Action 3]</li>
        </ul>
        <p><b>🧠 Additional Insights:</b> [Any tone analysis, domain-specific insights, or safety warnings]</p>
      `;

      const parts = [{ text: prompt }];
      for (const img of images) {
        parts.push({ inlineData: { data: img.split(',')[1], mimeType: "image/jpeg" } });
      }

      const result = await model.generateContent(parts);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.warn(`Fallback triggered: ${modelName} failed.`, error.message.substring(0, 100));
      lastError = error;
      // If it's not a generic 404 block, but an actual terminal failure, let it continue down the cascade.
    }
  }

  // If ALL models fail, throw the final error to the UI
  console.error("All Gemini AI Fallback paths exhausted:", lastError);
  throw lastError;
};
