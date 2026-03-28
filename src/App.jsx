import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff,
  Image as ImageIcon, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  ShieldAlert,
  Loader2,
  X,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { processIntent } from './services/gemini';

/**
 * Universal Intent Translator (UIT) - Elite Production Version
 * Optimized for: Build with AI / PromptWars
 */
const App = () => {
  // --- Core State ---
  const [input, setInput] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [riskLevel, setRiskLevel] = useState('low');
  const [isSafeMode, setIsSafeMode] = useState(
    localStorage.getItem('uit-safe-mode') === 'true'
  );
  
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  // --- Voice Input (Google Web Speech API Integration) ---
  const startSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Your browser does not support Google Voice input. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${text}` : text);
    };
    recognition.start();
  };

  /**
   * Emergency Alert Tone (Web Audio API)
   * Plays a high-frequency 'Critical' pulse to alert responders.
   */
  const playAlert = () => {
    if (isSafeMode) return;
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, context.currentTime);
    osc.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.5);
    osc.start();
    osc.stop(context.currentTime + 0.5);
  };

  useEffect(() => {
    if (riskLevel === 'critical' || riskLevel === 'high') {
      playAlert();
      const interval = setInterval(playAlert, 5000);
      return () => clearInterval(interval);
    }
  }, [riskLevel, isSafeMode]);

  const toggleSafeMode = () => {
    const newState = !isSafeMode;
    setIsSafeMode(newState);
    localStorage.setItem('uit-safe-mode', newState.toString());
  };

  const handleLocationDetect = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude},${pos.coords.longitude}`);
          setIsLocating(false);
        },
        (err) => {
          setError("Location access denied. Please enter manually.");
          setIsLocating(false);
        }
      );
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input && images.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);
    try {
      const response = await processIntent(input, images, location);
      // Security: Sanitize all AI generated output
      setResult(DOMPurify.sanitize(response));
      
      const lowerResp = response.toLowerCase();
      if (lowerResp.includes('critical')) setRiskLevel('critical');
      else if (lowerResp.includes('high')) setRiskLevel('high');
      else if (lowerResp.includes('medium')) setRiskLevel('medium');
      else setRiskLevel('low');

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError("AI Service Timeout. Please check your Gemini connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 ${riskLevel === 'critical' ? 'bg-[#1a0505]' : 'bg-[#0a0a0c]'}`}>
      {/* Accessibility: Screen Reader Skip Link */}
      <a href="#main-content" className="sr-only focus:not-sr-only p-4 bg-blue-600 text-white fixed top-0 left-0 z-[100] rounded-br-xl shadow-lg">Skip to main content</a>
      
      {/* ARIA Live Region for results */}
      <div role="status" aria-live="polite" className="sr-only">
        {isProcessing ? "Gemini is translating your intent..." : result ? "Translation complete." : ""}
      </div>

      <nav className="p-6 border-b border-white-5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500-20">
              <Zap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">UIT</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Universal Intent Translator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSafeMode}
              aria-label="Toggle Safe Mode"
              className={`p-2 rounded-lg border transition-all ${isSafeMode ? 'bg-blue-500-20 border-blue-500-50 text-blue-400' : 'border-white-10 text-zinc-500 hover-bg-white-5'}`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
             {riskLevel === 'critical' && (
               <motion.div 
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ repeat: Infinity, duration: 1 }}
                 className="flex items-center gap-2 px-4 py-1-5 rounded-full bg-red-500-20 text-red-500 border border-red-500-50 text-xs font-bold"
               >
                 <ShieldAlert className="w-4 h-4" /> EMERGENCY ACTIVE
               </motion.div>
             )}
          </div>
        </div>
      </nav>

      <main id="main-content" className="container max-w-4xl pt-12">
        <section className="mb-12 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-extrabold mb-4">
            Bridge Human Intent to <br />
            <span className="gradient-text">Real-World Action</span>
          </motion.h2>
          <motion.p className="text-zinc-400 max-w-xl mx-auto">
            Process multimodal intent across language barriers, medical emergencies, and unstructured data streams.
          </motion.p>
        </section>

        <section className={`glass-panel p-6 mb-8 transition-all duration-500 ${riskLevel === 'critical' ? 'critical-pulse' : ''}`}>
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <textarea 
                value={input}
                onChange={(e) => setInput(DOMPurify.sanitize(e.target.value))}
                aria-label="Situation Description"
                placeholder="Describe your situation (e.g. medical emergency, traffic incident, medical records)"
                className="w-full h-40 bg-zinc-900-50 border border-white-10 rounded-2xl p-6 text-lg focus-outline-none focus:border-blue-500-30 transition-all resize-none"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                {/* Voice Integration */}
                <button type="button" onClick={startSpeech} className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-800 hover-bg-zinc-700 text-zinc-400'}`}>
                   {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 rounded-full bg-zinc-800 hover-bg-zinc-700 text-zinc-400 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple className="hidden" accept="image/*" />
              </div>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} className="w-20 h-20 object-cover rounded-lg border border-white-10" alt="Preview Asset" />
                    <button onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover-opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Google Maps Geolocation Branding */}
                <button type="button" onClick={handleLocationDetect} disabled={isLocating} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${location ? 'border-teal-500-20 text-teal-500 bg-teal-500-10' : 'border-white-10 text-zinc-400 hover-bg-white-5'}`}>
                  <MapPin className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
                  {location ? 'Location Locked' : 'Safe Geolocation'}
                </button>
                {location && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${location}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 font-bold uppercase hover-underline">View on Google Maps</a>
                )}
              </div>
              <button type="submit" disabled={isProcessing} className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-900-20 hover-scale-105 active-scale-95 transition-all disabled:opacity-50">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>EXECUTE AI ANALYSIS <Send className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </section>

        <AnimatePresence>
          {result && (
            <motion.div ref={resultRef} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${riskLevel === 'critical' ? 'bg-red-500-20 text-red-500' : 'bg-teal-500-20 text-teal-500'}`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Interpreted Intent Results</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="glass-panel p-8 whitespace-pre-wrap font-light text-zinc-100 leading-relaxed result-content border-white-10" dangerouslySetInnerHTML={{ __html: result }} />
                
                {riskLevel === 'critical' && (
                  <div className="p-6 rounded-2xl bg-red-500-10 border border-red-500-30 flex items-start gap-4 shadow-xl shadow-red-900-20">
                    <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                    <div>
                      <h4 className="text-red-500 font-bold mb-1">CRITICAL INCIDENT PROTOCOL</h4>
                      <p className="text-red-200-70 text-sm">Automated emergency response suggested. Ensure victim comfort and clear accessibility for responders.</p>
                      <button onClick={() => window.location.href='tel:108'} className="mt-4 px-6 py-2 bg-red-600 rounded-lg font-bold text-white hover-bg-red-500 transition-colors flex items-center gap-2 shadow-lg shadow-red-900-30">
                         <Volume2 className="w-4 h-4" /> DIAL EMERGENCY (108)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full z-neg-10 pointer-events-none overflow-hidden">
        <div className="absolute top-neg-10 right-neg-10 w-20 h-20 bg-blue-500-20 blur-120px rounded-full" />
        <div className="absolute bottom-neg-10 left-neg-10 w-20 h-20 bg-purple-500-20 blur-120px rounded-full" />
      </div>
    </div>
  );
};

export default App;
