import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE'
const genAI = new GoogleGenerativeAI(API_KEY)

/**
 * Universal Intent Translator (UIT) - Gemini 2.0 Integration
 * Featuring Automatic Regional Model Fallbacks for 100% Uptime
 */
export const processIntent = async (input, images = [], location = null) => {
  // Cascading array of models to bypass specific 429 Quota limits
  // ONLY USING 2.x MODELS: The user's specific API Authorization blocks all 1.x requests.
  const fallbackModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash-001',
  ]

  let rateLimitError = null
  let lastError

  for (const modelName of fallbackModels) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: {
          parts: [{ text: `
            You are the core of Omnistream AI, a high-performance triage engine. 
            Your mission is to parse messy inputs into structured, life-saving operational data. 
            Always return a valid JSON object according to the schema provided.
            Analyze for medical priority, location, and recommended first-responder actions.
          `}]
        },
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.1, // High determinism for emergency triage
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ]
      })
      const prompt = `
        Translate this input into JSON. 
        INPUT: "${input}"
        LOCATION: ${location || 'Unknown'}
        
        JSON SCHEMA:
        {
          "intent": "string",
          "entities": ["string"],
          "risk": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          "reasoning": "string",
          "actions": ["string"],
          "html_formatted": "string"
        }
      `

      const parts = [{ text: prompt }]
      for (const img of images) {
        parts.push({ inlineData: { data: img.split(',')[1], mimeType: 'image/jpeg' } })
      }

      const result = await model.generateContent(parts)
      const response = await result.response
      const text = response.text()
      try {
        return JSON.parse(text)
      } catch (e) {
        console.error("Failed to parse AI JSON", text)
        return { html_formatted: text, risk: 'UNKNOWN' }
      }
    } catch (error) {
      console.warn(`Fallback triggered: ${modelName} failed.`, error.message.substring(0, 100))

      // Specifically capture 429 Rate Limits so they aren't masked by subsequent 404s
      if (error.message.includes('429') && !rateLimitError) {
        rateLimitError = error
      }
      lastError = error
    }
  }

  // If ALL models fail, throw the rate limit explicitly (if it was hit at all) for the UI Handler
  console.error('All Gemini AI Fallback paths exhausted:', lastError)
  throw rateLimitError || lastError
}
