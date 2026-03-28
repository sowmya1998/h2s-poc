import { describe, it, expect, vi } from 'vitest'
import { processIntent } from '../services/gemini'

// Mock the Google Generative AI integration to prevent real API calls during tests
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => '<p><b>⚠️ Risk Level:</b> CRITICAL - Simulated Emergency</p>',
          },
        }),
      }),
    })),
  }
})

describe('Gemini Universal Intent Translator Service', () => {
  it('should process inputs and return structured HTML', async () => {
    const response = await processIntent('Heart attack emergency', [], 'Lat: 40, Lng: -74')
    expect(response).toContain('CRITICAL')
    expect(response).toContain('<p>')
  })

  it('should handle missing location data gracefully', async () => {
    const response = await processIntent('Traffic accident', [])
    expect(response).toBeDefined()
  })

  it('should process images securely', async () => {
    // Simulated base64 image string
    const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...'
    const response = await processIntent('What is this medical note?', [mockImage])
    expect(response).toBeDefined()
  })
})
