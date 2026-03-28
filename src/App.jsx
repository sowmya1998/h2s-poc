import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { processIntent } from './services/gemini';

// Atomic Components for Efficiency
import TriageHeader from './components/TriageHeader';
import TriageInput from './components/TriageInput';

// Lazy load heavy output components for better performance scores
const TriageOutput = lazy(() => import('./components/TriageOutput'));

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
  const [isSafeMode, setIsSafeMode] = useState(localStorage.getItem('uit-safe-mode') === 'true');

  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  const startSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Your browser does not support Google Voice input. Please use Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${text}` : text));
    };
    recognition.start();
  };

  const playAlert = () => {
    if (isSafeMode) return;
    try {
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
    } catch (e) { console.error("Audio error", e) }
  };

  useEffect(() => {
    if (riskLevel === 'critical' || riskLevel === 'HIGH') {
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
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coordStr = `${pos.coords.latitude},${pos.coords.longitude}`;
          setLocation(coordStr);
          setIsLocating(false);
        },
        () => {
          setError('Location access denied. Please enter manually.');
          setIsLocating(false);
        }
      );
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImages((prev) => [...prev, reader.result]);
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
      setResult(response); // response is now a parsed object
      setRiskLevel(response.risk || 'low');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError(`AI Engine Error: ${err.message || 'Connection interrupted.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 relative overflow-hidden ${riskLevel === 'critical' ? 'bg-red-50' : 'bg-slate-50'}`}>
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px]" />
        {riskLevel === 'critical' && <div className="absolute inset-0 bg-red-500/5 animate-pulse" />}
      </div>

      <a href="#main-content" className="sr-only focus:not-sr-only p-4 bg-blue-600 text-white fixed top-0 left-0 z-[100] rounded-br-xl shadow-lg font-bold">
        Skip to Translation Engine
      </a>

      <TriageHeader 
        isSafeMode={isSafeMode} 
        toggleSafeMode={toggleSafeMode} 
        riskLevel={riskLevel} 
      />

      <main id="main-content" className="container max-w-4xl pt-12 relative z-10 px-4">
        <section className="mb-12 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] mb-6 shadow-sm border border-blue-200 uppercase tracking-widest">
            Gemini 2.x Advanced Triage
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black mb-4 text-slate-900 leading-tight">
            Universal Intelligence. <br/>
            <span className="text-blue-600">Immediate Response.</span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto font-medium text-lg">
            Converting multimodal chaos into life-saving operational data in seconds.
          </p>
        </section>

        <TriageInput 
          input={input} setInput={setInput}
          isProcessing={isProcessing}
          startSpeech={startSpeech} isListening={isListening}
          fileInputRef={fileInputRef} handleImageUpload={handleImageUpload}
          images={images} setImages={setImages}
          handleLocationDetect={handleLocationDetect} isLocating={isLocating}
          location={location} setLocation={setLocation}
          handleSubmit={handleSubmit}
        />

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-100 border border-red-200 text-red-700 font-bold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <Suspense fallback={<div className="text-center py-20 animate-pulse text-slate-400 font-bold">REFINING DATA...</div>}>
          <AnimatePresence>
            {result && <TriageOutput result={result} riskLevel={riskLevel} location={location} resultRef={resultRef} />}
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
