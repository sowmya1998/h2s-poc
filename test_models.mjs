import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.TEST_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const modelsToTest = [
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-pro",
  "gemini-1.5-flash", 
  "gemini-2.5-flash"
];

async function findWorkingModel() {
  for (const modelName of modelsToTest) {
    try {
      console.log(`Trying ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("hello");
      const resp = await result.response;
      console.log(`✅ SUCCESS with ${modelName}:`, resp.text().substring(0, 10));
      process.exit(0);
    } catch (err) {
      console.log(`❌ FAIL ${modelName}:`, err.message.substring(0, 100));
    }
  }
}

findWorkingModel();
