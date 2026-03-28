import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';
import MapDisplay from './MapDisplay';

const TriageOutput = ({ result, riskLevel, location, resultRef }) => (
  <motion.div
    ref={resultRef}
    initial={{ opacity: 0, scale: 0.98, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    className="space-y-6 mt-12 mb-20"
  >
    <div className="flex items-center gap-3">
      <div
        className={`p-3 rounded-xl shadow-md ${riskLevel === 'critical' || riskLevel === 'HIGH' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-teal-50 text-teal-600 border border-teal-200'}`}
      >
        {riskLevel === 'critical' || riskLevel === 'HIGH' ? (
          <ShieldAlert className="w-6 h-6" />
        ) : (
          <CheckCircle2 className="w-6 h-6" />
        )}
      </div>
      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Structured Output</h3>
    </div>

    <div className="grid grid-cols-1 gap-6">
      <div className="glass-panel p-8 whitespace-pre-wrap result-content border-slate-200">
        <div dangerouslySetInnerHTML={{ __html: result.html_formatted || result }} />
        {location && <MapDisplay coordinates={location} />}
      </div>

      {(riskLevel === 'critical' || riskLevel === 'HIGH') && (
        <div className="p-8 rounded-2xl bg-white border-2 border-red-500 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl shadow-red-500-20">
          <div className="p-4 bg-red-50 rounded-full shrink-0 animate-pulse border border-red-200">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-red-700 font-extrabold text-2xl mb-2">URGENT ACTION REQUIRED</h4>
            <p className="text-slate-600 text-base font-medium mb-6">
              Critical metrics detected. Emergency protocols initiated.
            </p>
            <button
              onClick={() => (window.location.href = 'tel:108')}
              className="px-8 py-3 bg-red-600 rounded-xl font-extrabold text-white shadow-lg flex items-center justify-center gap-2 text-lg hover-scale-105 active-scale-95 transition-all"
            >
              <Volume2 className="w-5 h-5" /> SOS TO DISPATCH (108)
            </button>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

export default TriageOutput;
