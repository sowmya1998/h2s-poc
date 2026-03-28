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
  Volume2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { processIntent } from './services/gemini';

const App = () => {
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
      setResult(DOMPurify.sanitize(response));
      
      const lowerResp = response.toLowerCase();
      if (lowerResp.includes('critical')) setRiskLevel('critical');
      else if (lowerResp.includes('high')) setRiskLevel('high');
      else if (lowerResp.includes('medium')) setRiskLevel('medium');
      else setRiskLevel('low');

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError("AI Service Timeout. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 relative overflow-hidden ${riskLevel === 'critical' ? 'bg-red-50' : 'bg-slate-50'}`}>
      
      {/* Dynamic Soft Light Background Orbs */}
      <div className="fixed inset-0 z-neg-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500-10 blur-120px rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500-10 blur-120px rounded-full" />
        {riskLevel === 'critical' && <div className="absolute inset-0 bg-red-500-10 blur-120px" />}
      </div>

      <a href="#main-content" className="sr-only focus:not-sr-only p-4 bg-blue-600 text-white fixed top-0 left-0 z-50 rounded-br-xl shadow-lg">Skip to Translation Engine</a>
      <div role="status" aria-live="polite" className="sr-only">
        {isProcessing ? "Analyzing incident data..." : result ? "Analysis complete." : ""}
      </div>

      <nav className="p-6 border-b border-white-50 backdrop-blur-md sticky top-0 z-50 bg-white-80 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500-20 shrink-0">
              <Zap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Omnistream AI</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Universal Intelligence Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="group relative">
               <button 
                 onClick={toggleSafeMode}
                 aria-label="Toggle Safe Mode"
                 className={`p-2 rounded-lg border transition-all shadow-sm ${isSafeMode ? 'bg-blue-50 border-blue-400 text-blue-600 hover-scale-105' : 'bg-white border-slate-200 text-slate-500 hover-bg-slate-100'}`}
               >
                 <Volume2 className={`w-5 h-5 ${isSafeMode ? 'opacity-50' : ''}`} />
               </button>
               <span className="tooltip-text">{isSafeMode ? "Enable Alarms" : "Mute Alarms"}</span>
            </div>
             {riskLevel === 'critical' && (
               <motion.div 
                 animate={{ scale: [1, 1.05, 1] }}
                 transition={{ repeat: Infinity, duration: 1 }}
                 className="flex items-center gap-2 px-4 py-1-5 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-bold shadow-sm"
               >
                 <ShieldAlert className="w-4 h-4" /> PRIORITY INCIDENT
               </motion.div>
             )}
          </div>
        </div>
      </nav>

      <main id="main-content" className="container max-w-4xl pt-12 relative z-10">
        <section className="mb-12 text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1-5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs mb-6 shadow-sm border border-blue-500-10">
            <Zap className="w-3 h-3 text-blue-600" /> GEMINI 2.0 FLASH POWERED
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-slate-900">
            Intelligent Triage.<br />
            <span className="gradient-text">Instant Clarity.</span>
          </motion.h2>
          <motion.p className="text-slate-600 max-w-xl mx-auto font-medium text-lg">
            Transform chaotic voice notes, medical photos, and messy text into structured, life-saving operational data in milliseconds.
          </motion.p>
        </section>

        <section className={`glass-panel p-8 mb-8 transition-all duration-500 ${riskLevel === 'critical' ? 'critical-pulse' : ''}`}>
          <form onSubmit={handleSubmit}>
            <div className="relative mb-6 group">
              <label htmlFor="intent-input" className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                1. Describe the Situation 
                <span className="group relative cursor-pointer text-blue-500">
                  <Info className="w-4 h-4" />
                  <span className="tooltip-text font-normal">Type via keyboard or click the microphone to dictate hands-free. Attach photos of prescriptions or scenes!</span>
                </span>
              </label>
              <textarea 
                id="intent-input"
                name="intent-input"
                value={input}
                onChange={(e) => setInput(DOMPurify.sanitize(e.target.value))}
                placeholder="E.g., 45yo male, severe chest pain radiating to left arm, history of hypertension..."
                className="input-light w-full h-40 rounded-2xl p-6 text-lg transition-all resize-none shadow-sm"
              />
              <div className="absolute bottom-6 right-6 flex items-center gap-3">
                <div className="group relative">
                  <button type="button" onClick={startSpeech} className={`p-3 w-12 h-12 flex justify-center items-center rounded-full transition-all shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse shadow-xl' : 'bg-white border border-slate-200 text-slate-700 hover-scale-105'}`}>
                     {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <span className="tooltip-text">{isListening ? "Listening... tap to stop" : "Start Voice Dictation"}</span>
                </div>
                <div className="group relative">
                  <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 w-12 h-12 flex justify-center items-center rounded-full bg-white border border-slate-200 text-slate-700 hover-scale-105 transition-all shadow-md">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  </button>
                  <span className="tooltip-text">Upload Documents or Photos</span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple className="hidden" accept="image/*" />
              </div>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                <p className="w-full text-xs font-bold text-slate-500 uppercase">Attached Evidence Context</p>
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} className="w-20 h-20 object-cover rounded-lg shadow-sm border border-slate-200 hover-scale-105 transition-all" alt="Evidence Preview" />
                    <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover-bg-red-600 transition-colors z-10">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="group relative">
                  <button type="button" onClick={handleLocationDetect} disabled={isLocating} className={`flex items-center gap-2 px-6 py-3 rounded-xl border shadow-sm transition-all font-semibold ${location ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-700 hover-scale-102'}`}>
                    <MapPin className={`w-5 h-5 ${isLocating ? 'animate-pulse text-blue-500' : location ? 'text-teal-600' : 'text-slate-400'}`} />
                    {location ? 'Signal Locked' : 'Acquire GPS Position'}
                  </button>
                  <span className="tooltip-text">Embed exact geographical coordinates into the alert</span>
                </div>
                {location && (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-teal-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Automated Localisation Active</span>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${location}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 font-bold uppercase transition-all mt-1 hover:underline">Verify Map Routing →</a>
                  </div>
                )}
              </div>
              <button type="submit" disabled={isProcessing} className="w-full md:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold flex items-center justify-center gap-3 shadow-xl shadow-blue-500-20 hover-scale-105 active-scale-95 transition-all disabled:opacity-50 tracking-wide text-lg border border-white-50">
                {isProcessing ? <><Loader2 className="w-6 h-6 animate-spin" /> SYNTHESIZING DATA...</> : <>GENERATE INTELLIGENCE <Send className="w-5 h-5" /></>}
              </button>
            </div>
            {error && <p className="mt-4 text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-200 shadow-sm flex items-center gap-2"><AlertCircle className="w-5 h-5" /> {error}</p>}
          </form>
        </section>

        <AnimatePresence>
          {result && (
            <motion.div ref={resultRef} initial={{ opacity: 0, scale: 0.98, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl shadow-md ${riskLevel === 'critical' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-teal-50 text-teal-600 border border-teal-200'}`}>
                  {riskLevel === 'critical' ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Structured Output</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="glass-panel p-8 whitespace-pre-wrap result-content border-slate-200">
                   <div dangerouslySetInnerHTML={{ __html: result }} />
                </div>
                
                {riskLevel === 'critical' && (
                  <div className="p-8 rounded-2xl bg-white border-2 border-red-500 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl shadow-red-500-20">
                    <div className="p-4 bg-red-50 rounded-full shrink-0 animate-pulse border border-red-200">
                      <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-red-700 font-extrabold text-2xl mb-2 tracking-tight">CRITICAL INCIDENT RESPONSE REQUIRED</h4>
                      <p className="text-slate-600 text-base font-medium mb-6">Automated emergency protocols triggered. Please maintain situational awareness and ensure safe perimeter for priority responders.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => window.location.href='tel:108'} className="px-8 py-3 bg-red-600 rounded-xl font-extrabold text-white hover-bg-red-500 transition-colors shadow-lg shadow-red-500-30 flex items-center justify-center gap-2 text-lg hover-scale-105 active-scale-95">
                           <Volume2 className="w-5 h-5" /> BROADCAST SOS TO DISPATCH (108)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
