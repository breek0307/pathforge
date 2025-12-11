import React, { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import LoadingState from './components/LoadingState';
import RoadmapDisplay from './components/RoadmapDisplay';
import NotificationToast from './components/NotificationToast';
import { AppState, Roadmap, UserInput } from './types';
import { generateLearningRoadmap } from './services/geminiService';
import { APP_NAME } from './constants';
import { IconSparkles } from './components/Icons';
import { getProgress } from './services/progressService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('LANDING');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Recover state from local storage on load (optional implementation for resilience)
  useEffect(() => {
    const saved = localStorage.getItem('pathforge_roadmap');
    if (saved) {
      try {
        setRoadmap(JSON.parse(saved));
        setAppState('RESULT');
      } catch (e) {
        localStorage.removeItem('pathforge_roadmap');
      }
    }

    // Reminder Check Interval
    const interval = setInterval(() => {
      const state = getProgress();
      if (state.reminderTime) {
        const now = new Date();
        const currentHM = now.toTimeString().slice(0, 5); // "HH:MM"
        
        // Simple check: matches time and seconds are low (to trigger once per minute)
        // In a real app we'd track "lastNotifiedDate" to prevent duplicates
        if (currentHM === state.reminderTime && now.getSeconds() < 2) {
          setNotificationMsg("Time to complete your learning tasks for today!");
          setShowNotification(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInputSubmit = async (input: UserInput) => {
    setAppState('LOADING');
    try {
      const result = await generateLearningRoadmap(input.goal, input.context, input.images);
      setRoadmap(result);
      localStorage.setItem('pathforge_roadmap', JSON.stringify(result));
      setAppState('RESULT');
    } catch (error) {
      console.error(error);
      alert("Something went wrong generating your plan. Please try again.");
      setAppState('INPUT');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('pathforge_roadmap');
    setRoadmap(null);
    setAppState('INPUT');
  };

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setAppState('LANDING')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-shadow">
              <IconSparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">{APP_NAME}</span>
          </div>
          
          {appState === 'RESULT' && (
            <div className="text-sm text-slate-400 hidden md:block">
              AI-Generated Personalized Plan
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {appState === 'LANDING' && (
          <div className="text-center mt-20 space-y-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary">
                Forge Your Skill Path
              </span>
              <br />
              <span className="text-white">Instantly</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Input your goals. Upload your notes. Let Gemini 3 Pro craft your personalized, multimodal learning roadmap in seconds.
            </p>
            <div className="pt-8">
              <button 
                onClick={() => setAppState('INPUT')}
                className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-cyan-50 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Start Forging
              </button>
            </div>
          </div>
        )}

        {appState === 'INPUT' && (
          <InputSection onSubmit={handleInputSubmit} />
        )}

        {appState === 'LOADING' && (
          <LoadingState />
        )}

        {appState === 'RESULT' && roadmap && (
          <RoadmapDisplay roadmap={roadmap} onReset={handleReset} />
        )}
      </main>

      {/* Global Notifications */}
      <NotificationToast 
        message={notificationMsg} 
        isVisible={showNotification} 
        onClose={() => setShowNotification(false)} 
      />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
