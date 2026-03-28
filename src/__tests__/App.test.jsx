import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';
import * as geminiService from '../services/gemini';

// Mock the Gemini Service so we don't hit the real API in tests
vi.mock('../services/gemini', () => {
  return {
    processIntent: vi.fn(),
  };
});

// Mocking window.SpeechRecognition for the Voice Input tests
const MockSpeechRecognition = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
}));
window.SpeechRecognition = MockSpeechRecognition;
window.webkitSpeechRecognition = MockSpeechRecognition;

// Mock audio API to prevent 'AudioContext is not defined' in JSDOM
window.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn(() => ({
    type: 'triangle',
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }
  })),
  currentTime: 0,
  destination: {}
}));

describe('UIT Application Core', () => {
  it('should render the dashboard successfully', () => {
    render(<App />);
    expect(screen.getByText('Universal Intent Translator')).toBeDefined();
    expect(screen.getByPlaceholderText(/Describe your situation/i)).toBeDefined();
  });

  it('should trigger the AI translation when submitting a description', async () => {
    geminiService.processIntent.mockResolvedValue('<p><b>⚠️ Risk Level:</b> LOW</p>');
    
    render(<App />);
    const input = screen.getByPlaceholderText(/Describe your situation/i);
    const submitBtn = screen.getByText(/EXECUTE AI ANALYSIS/i);

    fireEvent.change(input, { target: { value: 'This is a test' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/EXECUTE AI ANALYSIS/i)).toBeDisabled(); // Ensure loading state is active

    await waitFor(() => {
      // The DOMPurify injected HTML will insert the content
      expect(screen.getByText(/Translation complete/i)).toBeInTheDocument; // ARIA-live checks
    });
  });

  it('should enable Safe Mode (Audio mute state)', () => {
    render(<App />);
    const safeModeBtn = screen.getByLabelText(/Toggle Safe Mode/i);
    
    // Toggle on
    fireEvent.click(safeModeBtn);
    expect(localStorage.getItem('uit-safe-mode')).toBe('true');
    
    // Toggle off
    fireEvent.click(safeModeBtn);
    expect(localStorage.getItem('uit-safe-mode')).toBe('false');
  });

});
