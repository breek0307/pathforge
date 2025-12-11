import React, { useState, useEffect, useRef } from 'react';
import { Roadmap, DailyPlan, Task } from '../types';
import { 
  initializeDailyCheck, 
  updateCompletedTasks, 
  addJournalEntry, 
  setReminderTime, 
  getDayOfJourney, 
  getProgress 
} from '../services/progressService';
import { 
  IconCheckCircle, 
  IconFlame, 
  IconTrophy, 
  IconClock, 
  IconTarget, 
  IconSend, 
  IconBell, 
  IconRefresh,
  IconBook,
  IconSparkles
} from './Icons';

interface DailyProgressHubProps {
  roadmap: Roadmap;
}

const DailyProgressHub: React.FC<DailyProgressHubProps> = ({ roadmap }) => {
  const [journeyDay, setJourneyDay] = useState(1);
  const [todaysPlan, setTodaysPlan] = useState<DailyPlan | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [reflection, setReflection] = useState('');
  const [reminder, setReminder] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [journalHistory, setJournalHistory] = useState<{date: string, content: string}[]>([]);
  
  // Animation state for the percentage text
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [isPulseActive, setIsPulseActive] = useState(false);

  // Initialize
  useEffect(() => {
    const { state, isNewDay, yesterdayStats } = initializeDailyCheck();
    
    // Calculate which day of the roadmap we are on
    const currentDayIndex = getDayOfJourney(state.roadmapStartDate);
    setJourneyDay(currentDayIndex);

    // Find the plan for this day (or clamp to last day if finished)
    // Assuming dailyPlans is sorted or we search by 'day' property
    const effectiveDay = Math.min(currentDayIndex, roadmap.dailyPlans.length);
    const plan = roadmap.dailyPlans.find(d => d.day === effectiveDay) || roadmap.dailyPlans[0];
    setTodaysPlan(plan);

    // Restore today's progress from history if it exists
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEntry = state.history.find(h => h.date === todayStr);
    
    if (todayEntry) {
      setCompletedTaskIds(todayEntry.completedTaskIds);
      setTimeSpent(todayEntry.timeSpentMinutes);
    } else if (isNewDay) {
      setCompletedTaskIds([]);
      setTimeSpent(0);
    }

    setStreak(state.currentStreak);
    setReminder(state.reminderTime || '');
    setJournalHistory(state.journal);

    // Feedback message logic
    if (isNewDay && yesterdayStats) {
      setFeedbackMessage(`New day, new progress! You completed ${yesterdayStats.completionPercentage}% of yesterday's tasks.`);
    } else if (isNewDay) {
       setFeedbackMessage("New day, new progress! Let's keep the momentum going.");
    }

  }, [roadmap]);

  const toggleTask = (taskId: string) => {
    const newCompleted = completedTaskIds.includes(taskId)
      ? completedTaskIds.filter(id => id !== taskId)
      : [...completedTaskIds, taskId];
    
    setCompletedTaskIds(newCompleted);
    saveProgress(newCompleted, timeSpent);
    triggerPulse();
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setTimeSpent(val);
    saveProgress(completedTaskIds, val);
    triggerPulse();
  };
  
  const triggerPulse = () => {
    setIsPulseActive(true);
    setTimeout(() => setIsPulseActive(false), 300);
  };

  const saveProgress = (tasks: string[], time: number) => {
    if (!todaysPlan) return;
    const totalTasks = todaysPlan.tasks.length;
    const pct = totalTasks > 0 ? Math.round((tasks.length / totalTasks) * 100) : 0;
    updateCompletedTasks(tasks, pct, time);
  };

  const handleJournalSubmit = () => {
    if (!reflection.trim()) return;
    const newState = addJournalEntry(reflection);
    setJournalHistory(newState.journal);
    setReflection('');
    setFeedbackMessage("Reflection saved to your journal!");
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleSetReminder = () => {
    if (!reminder) return;
    setReminderTime(reminder);
    setFeedbackMessage(`Daily reminder set for ${reminder}`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const clearToday = () => {
    if(confirm("Are you sure you want to reset today's checklist?")) {
      setCompletedTaskIds([]);
      setTimeSpent(0);
      saveProgress([], 0);
      triggerPulse();
    }
  };

  const calculateDailyProgress = () => {
    if (!todaysPlan || todaysPlan.tasks.length === 0) return 0;
    return Math.round((completedTaskIds.length / todaysPlan.tasks.length) * 100);
  };

  const actualProgress = calculateDailyProgress();
  const isMilestone = [3, 7, 14, 30, 60, 90, 100].includes(streak);

  // Smooth number animation effect using requestAnimationFrame
  useEffect(() => {
    if (displayPercentage === actualProgress) return;

    let animationFrameId: number;
    const duration = 1000; // ms
    const startTime = performance.now();
    const startValue = displayPercentage;
    const endValue = actualProgress;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: Ease Out Quart
      const ease = 1 - Math.pow(1 - progress, 4);
      
      const newValue = startValue + (endValue - startValue) * ease;
      setDisplayPercentage(newValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [actualProgress]); // Re-run when target progress changes

  if (!todaysPlan) return <div className="p-8 text-center">Loading Hub...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <IconTarget className="text-primary" /> Daily Progress Hub
          </h2>
          <p className="text-slate-400 text-sm">Day {journeyDay} of your journey • {todaysPlan.title}</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-300 ${isMilestone ? 'bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.25)] ring-1 ring-orange-500/30' : ''}`}>
             <div className="relative">
               <IconFlame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500' : 'text-slate-600'} ${streak > 0 ? 'animate-pulse' : ''}`} fill={streak > 0 ? "currentColor" : "none"} />
               {isMilestone && (
                  <div className="absolute -top-2 -right-2">
                    <IconSparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin-slow drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" fill="currentColor" />
                  </div>
               )}
             </div>
             <div>
               <span className={`block text-sm font-bold transition-colors ${isMilestone ? 'text-orange-100' : 'text-white'}`}>{streak} Day Streak</span>
             </div>
          </div>
          <div className="h-8 w-px bg-slate-700"></div>
          <div className="flex items-center gap-2 px-3">
            <IconTrophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-bold text-white">{Math.round(displayPercentage)}% Done</span>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="bg-primary/10 border border-primary/30 text-primary p-3 rounded-lg text-sm text-center animate-fade-in">
          {feedbackMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Column: Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-t border-primary/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <IconCheckCircle className="text-secondary" /> Today's Checklist
              </h3>
              <button onClick={clearToday} className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                <IconRefresh size={12} /> Reset
              </button>
            </div>

            <div className="space-y-3">
              {todaysPlan.tasks.map((task, idx) => {
                 const tId = task.id || `daily-${journeyDay}-${idx}`;
                 const isDone = completedTaskIds.includes(tId);
                 return (
                  <div 
                    key={tId} 
                    onClick={() => toggleTask(tId)}
                    className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isDone ? 'bg-primary/5 border-primary/30' : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 hover:bg-slate-800'}`}
                  >
                    <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-primary border-primary text-slate-900' : 'border-slate-500 group-hover:border-primary'}`}>
                      {isDone && <IconCheckCircle size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium transition-colors ${isDone ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {task.description}
                      </p>
                      {task.duration && (
                        <span className="text-xs text-slate-500 mt-1 block flex items-center gap-1">
                           <IconClock size={10} /> {task.duration}
                        </span>
                      )}
                    </div>
                  </div>
                 );
              })}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <IconBook className="text-purple-400" /> Daily Reflection
             </h3>
             <textarea
               value={reflection}
               onChange={(e) => setReflection(e.target.value)}
               placeholder="What did you learn today? What was difficult?"
               className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all h-32 resize-none mb-3"
             />
             <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Saved to localStorage</span>
                <button 
                  onClick={handleJournalSubmit}
                  disabled={!reflection.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconSend size={14} /> Save Entry
                </button>
             </div>
          </div>
        </div>

        {/* Sidebar: Stats & Settings */}
        <div className="space-y-6">
          
          {/* Summary Card */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Today's Progress</h4>
            
            <div className={`relative w-36 h-36 mb-4 transition-transform duration-300 ${isPulseActive ? 'scale-105' : 'scale-100'}`}>
               {/* Glow effect behind circle */}
               <div className={`absolute inset-0 rounded-full bg-primary/20 blur-xl transition-opacity duration-1000 ${actualProgress > 0 ? 'opacity-100' : 'opacity-0'}`}></div>

               <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" viewBox="0 0 100 100">
                 <defs>
                   <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
                     <stop offset="100%" stopColor="#a855f7" /> {/* Purple */}
                   </linearGradient>
                 </defs>

                 {/* Background Circle */}
                 <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="6" />
                 
                 {/* Progress Circle */}
                 <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="url(#progressGradient)" strokeWidth="6" 
                    strokeDasharray="283" 
                    strokeDashoffset={283 - (283 * actualProgress / 100)} 
                    className="transition-[stroke-dashoffset] duration-1000 ease-in-out"
                    strokeLinecap="round"
                 />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-white tracking-tighter transition-all duration-300 transform scale-100">
                    {Math.round(displayPercentage)}%
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Complete</span>
               </div>
            </div>

            <div className="w-full pt-4 border-t border-slate-700/50">
               <label className="text-xs text-slate-500 block mb-2">Time Spent (Minutes)</label>
               <input 
                  type="number" 
                  value={timeSpent}
                  onChange={handleTimeChange}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center text-white focus:border-primary outline-none transition-colors" 
               />
            </div>
          </div>

          {/* Reminder Card */}
          <div className="glass-panel p-6 rounded-2xl">
             <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
               <IconBell size={14} /> Reminder Settings
             </h4>
             <div className="flex gap-2">
               <input 
                  type="time" 
                  value={reminder} 
                  onChange={(e) => setReminder(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-primary"
               />
               <button 
                  onClick={handleSetReminder}
                  className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-slate-700 transition-colors"
                >
                  Save
               </button>
             </div>
             <p className="text-xs text-slate-500 mt-2">
               We'll notify you daily at this time to complete your tasks.
             </p>
          </div>

          {/* Recent Journal */}
          {journalHistory.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl max-h-60 overflow-y-auto">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Past Reflections</h4>
              <div className="space-y-4">
                {journalHistory.slice(0, 3).map((entry, i) => (
                  <div key={i} className="text-sm border-l-2 border-slate-700 pl-3">
                    <span className="text-xs text-primary block mb-1">{entry.date}</span>
                    <p className="text-slate-300 line-clamp-2">{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DailyProgressHub;