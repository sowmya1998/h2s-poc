import React from 'react';
import { Zap, Volume2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const TriageHeader = ({ isSafeMode, toggleSafeMode, riskLevel }) => (
  <nav className="p-6 border-b border-white-50 backdrop-blur-md sticky top-0 z-50 bg-white-80 shadow-sm">
    <div className="max-w-6xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500-20 shrink-0">
          <Zap className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Omnistream AI
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Universal Intelligence Hub
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="group relative">
          <button
            onClick={toggleSafeMode}
            aria-label={isSafeMode ? 'Enable Alarms' : 'Mute Alarms'}
            className={`p-2 rounded-lg border transition-all shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none ${isSafeMode ? 'bg-blue-50 border-blue-400 text-blue-600 hover:scale-110 active:scale-95' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:scale-110 active:scale-95'}`}
          >
            <Volume2 className={`w-5 h-5 ${isSafeMode ? 'opacity-50' : ''}`} />
          </button>
          <span className="tooltip-text">{isSafeMode ? 'Enable Alarms' : 'Mute Alarms'}</span>
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
);

export default TriageHeader;
