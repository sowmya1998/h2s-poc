import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  try {
    console.log("Testing gemini-2.0-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are an AI-powered Universal Intent Translator designed for the PromptWars challenge.
      Your goal is to parse messy inputs into clean, actionable, formatted data to bridge the gap between human emergencies and system responses.
      
      INPUT: "20 year old having sudden heart pain"
      CONTEXT: "Unknown Location"
      
      FOLLOW THE 7-STEP PROCESS (Intent, Domain, JSON Data, Risk Level, 3+ Actions, Tone, Format).
      
      You MUST format your response using standard, clean HTML tags (like <b>, <ul>, <li>, <p>, <br>) so it renders beautifully in a web UI. Do NOT use markdown.
      Format EXACTLY as follows:
      
      <p><b>🔍 Interpreted Intent:</b> [Summary]</p>
      <p><b>📊 Structured Data:</b> <code>[JSON string]</code></p>
      <p><b>⚠️ Risk Level:</b> [LOW / MEDIUM / HIGH / CRITICAL] - [Reason]</p>
      <p><b>✅ Recommended Actions:</b></p>
      <ul><li>...</li></ul>
      <p><b>🧠 Additional Insights:</b> [Insights]</p>
    `;
    const result = await model.generateContent([{ text: prompt }]);
    const response = await result.response;
    console.log("SUCCESS:\n", response.text().substring(0, 150) + "...");
  } catch (err) {
    console.error("FAIL:", err.message);
  }
}

test();
