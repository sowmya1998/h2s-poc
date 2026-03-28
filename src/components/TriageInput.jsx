import React from 'react';
import { Info, Loader2, Mic, MicOff, Image as ImageIcon, X, MapPin, Send } from 'lucide-react';

const TriageInput = ({
  input, setInput, isProcessing, startSpeech, isListening,
  fileInputRef, handleImageUpload, images, setImages,
  handleLocationDetect, isLocating, location, setLocation, handleSubmit
}) => (
  <section className={`glass-panel p-8 mb-8 transition-all duration-500 relative`}>
    <form onSubmit={handleSubmit}>
      <div className="relative mb-6">
        <label
          htmlFor="intent-input"
          className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"
        >
          1. Describe the Situation
          <span className="group relative cursor-pointer text-blue-500">
            <Info className="w-4 h-4" />
            <span className="tooltip-text font-normal text-xs z-20">
              Type or dictate hands-free. Attach photos of prescriptions or scenes!
            </span>
          </span>
        </label>

        <div className="relative">
          <textarea
            id="intent-input"
            name="intent-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., 45yo male, severe chest pain radiating to left arm..."
            className="input-light w-full h-40 rounded-2xl p-6 text-lg transition-all shadow-sm"
            disabled={isProcessing}
          />

          {isProcessing && (
            <div className="absolute inset-0 bg-white-80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-10 border-2 border-blue-400">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-extrabold text-blue-600 uppercase">
                Synthesizing
              </h3>
            </div>
          )}

          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            <button
              type="button"
              onClick={startSpeech}
              aria-label={isListening ? 'Stop Voice Dictation' : 'Start Voice Dictation'}
              className={`p-3 rounded-full transition-all shadow-md focus:ring-2 focus:ring-red-400 focus:outline-none ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-slate-200 text-slate-700'}`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              aria-label="Upload Evidence Photos"
              className="p-3 rounded-full bg-white border border-slate-200 text-slate-700 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={img} className="w-20 h-20 object-cover rounded-lg shadow-sm" alt="Evidence" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, i) => i !== idx))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between pt-4 border-t border-slate-200 mt-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button
            type="button"
            onClick={handleLocationDetect}
            disabled={isLocating}
            className={`flex items-center justify-center w-full gap-2 px-6 py-3 rounded-xl border shadow-sm transition-all font-semibold ${location ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-700'}`}
          >
            <MapPin className={`w-5 h-5 ${isLocating ? 'animate-pulse text-blue-500' : 'text-slate-400'}`} />
            {location ? 'Signal Locked' : 'Auto GPS'}
          </button>
          <input
            value={location || ''}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Manual location..."
            className="input-light w-full rounded-xl px-4 py-3 text-sm shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full md:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold flex items-center justify-center gap-3 shadow-xl transition-all"
        >
          {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>GENERATE INTELLIGENCE <Send className="w-5 h-5" /></>}
        </button>
      </div>
    </form>
  </section>
);

export default TriageInput;
