import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.TEST_API_KEY);
  console.log("Fetching available models...");
  try {
    const fetch = (await import('node-fetch')).default || globalThis.fetch;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.TEST_API_KEY}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name).join("\n"));
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

run();
