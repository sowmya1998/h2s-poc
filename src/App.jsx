import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
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
import { processIntent } from './services/gemini';

const App = () => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [riskLevel, setRiskLevel] = useState('low');
  const [isSafeMode, setIsSafeMode] = useState(
    localStorage.getItem('uit-safe-mode') === 'true'
  );
  
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

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
          setLocation(`Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`);
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
      setResult(response);
      if (response.toLowerCase().includes('critical')) setRiskLevel('critical');
      else if (response.toLowerCase().includes('high')) setRiskLevel('high');
      else if (response.toLowerCase().includes('medium')) setRiskLevel('medium');
      else setRiskLevel('low');
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError("Failed to process intent. Please check your API key.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 ${riskLevel === 'critical' ? 'bg-[#1a0505]' : 'bg-[#0a0a0c]'}`}>
      <nav className="p-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
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
              className={`p-2 rounded-lg border transition-all ${isSafeMode ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'border-white/10 text-zinc-500 hover:bg-white/5'}`}
              title={isSafeMode ? "Safe Mode Active (Audio Muted)" : "Enable Safe Mode (Mute Emergency Audio)"}
            >
              <Volume2 className={`w-5 h-5 ${isSafeMode ? 'opacity-50' : ''}`} />
            </button>
             {riskLevel === 'critical' && (
               <motion.div 
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ repeat: Infinity, duration: 1 }}
                 className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/50 text-xs font-bold"
               >
                 <ShieldAlert className="w-4 h-4" /> EMERGENCY MODE ACTIVE
               </motion.div>
             )}
          </div>
        </div>
      </nav>

      <main className="container max-w-4xl pt-12">
        <section className="mb-12 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-extrabold mb-4">
            Bridge Human Intent to <br />
            <span className="gradient-text">Real-World Action</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-zinc-400 max-w-xl mx-auto">
            Translate messy human language, medical records, or emergency situations into structured data and life-saving steps instantly.
          </motion.p>
        </section>

        <section className={`glass-panel p-6 mb-8 transition-all duration-500 ${riskLevel === 'critical' ? 'critical-pulse' : ''}`}>
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Problem Description Input"
                placeholder="Describe your problem or messy input here... (e.g. medical emergency, traffic chaos, medical history notes)"
                className="w-full h-40 bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-lg focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple className="hidden" accept="image/*" />
              </div>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} className="w-20 h-20 object-cover rounded-lg border border-white/20" alt="preview" />
                    <button onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button type="button" onClick={handleLocationDetect} disabled={isLocating} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${location ? 'border-teal-500/50 text-teal-500' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}>
                  <MapPin className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
                  {location ? 'Location Set' : 'Auto Detect Location'}
                </button>
                <div className="flex-1 md:w-48 relative">
                   <input value={location || ''} onChange={(e) => setLocation(e.target.value)} placeholder="Set manual location..." className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500/30" />
                </div>
              </div>
              <button type="submit" disabled={isProcessing} className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>PROCESS INTENT <Send className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </section>

        <AnimatePresence>
          {result && (
            <motion.div ref={resultRef} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${riskLevel === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-teal-500/20 text-teal-500'}`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Translation Results</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="glass-panel p-8 whitespace-pre-wrap font-light text-zinc-100 leading-relaxed result-content">
                  {result}
                </div>
                {riskLevel === 'critical' && (
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                    <div>
                      <h4 className="text-red-500 font-bold mb-1">CRITICAL ALERT DETECTED</h4>
                      <p className="text-red-200/70 text-sm">Please follow top recommendations immediately. Emergency services should be contacted as priority #1.</p>
                      <button onClick={() => window.location.href='tel:108'} className="mt-4 px-6 py-2 bg-red-600 rounded-lg font-bold text-white hover:bg-red-700 transition-colors flex items-center gap-2">
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
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default App;
