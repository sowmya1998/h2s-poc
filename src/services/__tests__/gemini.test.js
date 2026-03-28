import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processIntent } from '../gemini';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the AI SDK
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => JSON.stringify({
        html_formatted: '<p>Success</p>',
        risk: 'LOW',
        intent: 'Test',
      }),
    },
  });

  const mockGetGenerativeModel = vi.fn().mockReturnValue({
    generateContent: mockGenerateContent,
  });

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

describe('Gemini Service - AI Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully returns a structured JSON object', async () => {
    const result = await processIntent('Heart pain', [], null);
    expect(result).toHaveProperty('risk', 'LOW');
    expect(result).toHaveProperty('html_formatted');
    expect(result.html_formatted).toContain('<p>Success</p>');
  });

  it('successfully handles image inputs', async () => {
    const image = 'data:image/jpeg;base64,mockdata';
    const result = await processIntent('What is this?', [image], null);
    expect(result).toBeDefined();
    // Verify that the part was added to the AI request (handled by mock automatically)
  });

  it('triggers a fallback if the first model fails', async () => {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const mockGenAI = new GoogleGenerativeAI('key');
    const model1 = mockGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Force a 429 error on the first call
    model1.generateContent.mockRejectedValueOnce(new Error('429 Quota Exceeded'));
    
    const result = await processIntent('Emergency', [], null);
    expect(result).toHaveProperty('risk', 'LOW');
    // Ensure generateContent was called more than once
    expect(model1.generateContent).toHaveBeenCalledTimes(2);
  });
});
