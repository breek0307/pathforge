import React, { useEffect, useState } from 'react';
import { LOADING_MESSAGES } from '../constants';

const LoadingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500); // Rotate message every 2.5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      {/* Central Orb Animation */}
      <div className="relative w-32 h-32 mb-12">
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-secondary border-l-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-secondary border-b-transparent border-l-primary animate-spin-slow opacity-70"></div>
        <div className="absolute inset-0 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-pulse-fast"></div>
        
        {/* Inner Core */}
        <div className="absolute inset-0 m-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 glass-panel">
           <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2 animate-fade-in">
        Forging Your Path...
      </h3>
      
      <div className="h-8 overflow-hidden relative w-full max-w-md">
        <p className="text-primary/80 font-mono text-sm uppercase tracking-widest transition-all duration-500 absolute w-full left-0 top-0">
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>

      <div className="mt-8 w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary via-secondary to-primary w-[200%] animate-[shimmer_2s_infinite_linear]"></div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
