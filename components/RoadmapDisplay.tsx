import React, { useState } from 'react';
import { Roadmap, Task } from '../types';
import DailyProgressHub from './DailyProgressHub';
import { 
  IconCheckCircle, 
  IconCalendar, 
  IconMap, 
  IconDownload, 
  IconRefresh, 
  IconAlert, 
  IconChevronDown, 
  IconChevronUp,
  IconBook,
  IconActivity,
  IconLayers,
  IconLayout
} from './Icons';

interface RoadmapDisplayProps {
  roadmap: Roadmap;
  onReset: () => void;
}

const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ roadmap, onReset }) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'daily' | 'weekly' | 'overview'>('progress');
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateProgress = () => {
    // Flatten all tasks
    const allTasks = roadmap.dailyPlans.flatMap(d => d.tasks);
    if (allTasks.length === 0) return 0;
    const completedCount = allTasks.filter(t => completedTasks[t.id]).length;
    return Math.round((completedCount / allTasks.length) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
      
      {/* Header Summary */}
      <div className="glass-panel p-8 rounded-3xl mb-8 border-t border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{roadmap.title}</h1>
              <p className="text-slate-400 max-w-2xl">{roadmap.overview}</p>
            </div>
            <div className="flex gap-3 no-print">
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all text-white border border-slate-700">
                <IconDownload size={16} /> Export PDF
              </button>
              <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all text-white border border-slate-700">
                <IconRefresh size={16} /> New Plan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Timeline</span>
              <span className="text-lg font-semibold text-primary">{roadmap.timelineEstimate}</span>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Current Level</span>
              <span className="text-lg font-semibold text-secondary">{roadmap.currentLevelEstimate}</span>
            </div>
             <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 col-span-2 md:col-span-2">
               <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Progress</span>
                <span className="text-xs text-white font-mono">{calculateProgress()}%</span>
               </div>
               <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                 <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000" 
                  style={{ width: `${calculateProgress()}%` }}
                />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex gap-2 mb-6 no-print overflow-x-auto pb-2">
        <TabButton active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={IconLayout} label="Daily Hub" />
        <TabButton active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} icon={IconCalendar} label="Full Schedule" />
        <TabButton active={activeTab === 'weekly'} onClick={() => setActiveTab('weekly')} icon={IconMap} label="Weekly Roadmap" />
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={IconLayers} label="Full Overview" />
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'progress' && (
          <DailyProgressHub roadmap={roadmap} />
        )}

        {activeTab === 'daily' && (
          <div className="space-y-4">
            {roadmap.dailyPlans.map((day) => (
              <div key={day.day} className={`glass-panel rounded-xl overflow-hidden transition-all duration-300 ${expandedDay === day.day ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-slate-800'}`}>
                <div 
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border ${expandedDay === day.day ? 'bg-primary/20 text-primary border-primary/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                      {day.day}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg">{day.title}</h4>
                      <p className="text-sm text-slate-400">Focus: {day.focus}</p>
                    </div>
                  </div>
                  <div className="text-slate-500">
                    {expandedDay === day.day ? <IconChevronUp /> : <IconChevronDown />}
                  </div>
                </div>

                {expandedDay === day.day && (
                  <div className="p-6 pt-0 border-t border-white/5 animate-fade-in">
                    <div className="mt-4 space-y-3">
                      {day.tasks.map((task, idx) => {
                         // Fallback ID if missing
                         const tId = task.id || `${day.day}-${idx}`;
                         return (
                          <div key={tId} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                            <button 
                              onClick={() => toggleTask(tId)}
                              className={`mt-0.5 shrink-0 transition-colors ${completedTasks[tId] ? 'text-primary' : 'text-slate-600 group-hover:text-slate-500'}`}
                            >
                              <IconCheckCircle size={20} fill={completedTasks[tId] ? "currentColor" : "none"} />
                            </button>
                            <span className={`text-slate-300 ${completedTasks[tId] ? 'line-through text-slate-600' : ''}`}>
                              {task.description}
                            </span>
                          </div>
                         )
                      })}
                    </div>
                    
                    {day.resources.length > 0 && (
                      <div className="mt-6 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <IconBook size={14} /> Recommended Resources
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {day.resources.map((res, i) => (
                            <a 
                              key={i} 
                              href={res.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex items-center gap-2 text-sm text-cyan-400 hover:underline hover:text-cyan-300 truncate"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                              {res.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="grid md:grid-cols-2 gap-6">
            {roadmap.weeklySummaries.map((week) => (
              <div key={week.week} className="glass-panel p-6 rounded-2xl border-t-4 border-t-secondary/50">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-secondary font-bold text-sm uppercase tracking-widest">Week {week.week}</span>
                  <IconActivity size={18} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{week.theme}</h3>
                <ul className="space-y-2 mb-6">
                  {week.objectives.map((obj, i) => (
                    <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                      <span className="text-secondary mt-1.5">•</span> {obj}
                    </li>
                  ))}
                </ul>
                <div className="bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                  <p className="text-xs text-secondary uppercase font-bold mb-1">Checkpoint</p>
                  <p className="text-sm text-white">{week.checkpoint}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid gap-6">
              {roadmap.phases.map((phase, index) => (
                <div key={index} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary"></div>
                  <div className="pl-4">
                    <h3 className="text-lg font-bold text-white mb-1">{phase.name}</h3>
                    <p className="text-xs text-primary mb-3 font-mono">{phase.duration}</p>
                    <p className="text-slate-400 leading-relaxed">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <IconAlert className="text-red-400" /> Predicted Challenges
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {roadmap.predictedChallenges.map((challenge, i) => (
                  <div key={i} className="bg-slate-900/60 p-4 rounded-xl">
                    <p className="text-red-300 font-medium text-sm mb-2">{challenge.problem}</p>
                    <p className="text-slate-400 text-xs">💡 {challenge.solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${active ? 'bg-white text-slate-900 shadow-lg shadow-white/10' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default RoadmapDisplay;
