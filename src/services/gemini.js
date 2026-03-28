import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Universal Intent Translator (UIT) - Gemini 2.0 Flash Integration
 * Processes messy, multimodal human inputs (text, voice, images) into structured,
 * actionable data for emergency responders and societal benefit.
 * 
 * @param {string} input - The raw human intent (dirty text/voice transcript).
 * @param {string[]} [images=[]] - Array of Base64 encoded images (e.g., medical notes/crash photos).
 * @param {string} [location=null] - The detected GPS coordinates for context.
 * @returns {Promise<string>} The structured, translated output ready for UI rendering.
 * @throws {Error} Throws an error if the API request fails due to quota or network issues.
 */
export const processIntent = async (input, images = [], location = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
    console.error("Gemini Error:", error);
    throw error;
  }
};
