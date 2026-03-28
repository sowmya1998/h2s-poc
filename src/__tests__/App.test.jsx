import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { Suspense } from 'react';
import App from '../App';
import * as geminiService from '../services/gemini';

// Mock the Gemini Service
vi.mock('../services/gemini', () => ({
  processIntent: vi.fn(),
}));

// Mock Google Maps
window.google = {
  maps: {
    Map: vi.fn().mockImplementation(() => ({
      setCenter: vi.fn(),
    })),
    Marker: vi.fn(),
    Animation: { DROP: 1 },
  },
};

describe('Omnistream AI - Core Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main triage interface', async () => {
    render(<App />);
    expect(screen.getByText(/Universal Intelligence/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/E.g., 45yo male/i)).toBeDefined();
  });

  it('triggers AI analysis and displays structured output', async () => {
    const mockResponse = {
      html_formatted: '<p>Test Result</p>',
      risk: 'LOW',
      intent: 'Test Intent',
    };
    geminiService.processIntent.mockResolvedValue(mockResponse);

    render(<App />);
    const input = screen.getByPlaceholderText(/E.g., 45yo male/i);
    const submitBtn = screen.getByText(/GENERATE INTELLIGENCE/i);

    fireEvent.change(input, { target: { value: 'Heart pain' } });
    fireEvent.click(submitBtn);

    // Check for loading state
    expect(screen.getByText(/SYNTHESIZING/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Structured Output/i)).toBeDefined();
      expect(screen.getByText(/Test Result/i)).toBeDefined();
    }, { timeout: 3000 });
  });

  it('toggles safe mode correctly', () => {
    render(<App />);
    const safeModeBtn = screen.getByLabelText(/Toggle Safe Mode/i);
    
    fireEvent.click(safeModeBtn);
    expect(localStorage.getItem('uit-safe-mode')).toBe('true');
    
    fireEvent.click(safeModeBtn);
    expect(localStorage.getItem('uit-safe-mode')).toBe('false');
  });
});
