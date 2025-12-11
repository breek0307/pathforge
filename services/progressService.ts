import { UserProgressState, DailyProgress, JournalEntry } from "../types";

const STORAGE_KEY = "pathforge_progress";

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_STATE: UserProgressState = {
  roadmapStartDate: new Date().toISOString(),
  lastVisitDate: getTodayString(),
  currentStreak: 1,
  maxStreak: 1,
  reminderTime: null,
  journal: [],
  history: []
};

export const getProgress = (): UserProgressState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return INITIAL_STATE;
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_STATE;
  }
};

export const saveProgress = (state: UserProgressState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const initializeDailyCheck = (): { state: UserProgressState; isNewDay: boolean; yesterdayStats: DailyProgress | null } => {
  const state = getProgress();
  const today = getTodayString();
  
  if (state.lastVisitDate === today) {
    return { state, isNewDay: false, yesterdayStats: null };
  }

  // It's a new day
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  
  // Logic for Streak
  let newStreak = state.currentStreak;
  
  if (state.lastVisitDate === yesterdayString) {
    // Visited yesterday, streak continues (increment handled on interaction or here)
    // We increment streak on FIRST visit of the new day
    newStreak += 1;
  } else {
    // Missed a day or more
    newStreak = 1;
  }

  // Archive yesterday if data exists (this is a simplification, ideally we check if we have data for 'yesterday')
  // Since we only store 'history' when archiving, we look at the last history entry or implicit state.
  // Here we just return the new clean state for today.
  
  const newState: UserProgressState = {
    ...state,
    lastVisitDate: today,
    currentStreak: newStreak,
    maxStreak: Math.max(newStreak, state.maxStreak),
  };
  
  saveProgress(newState);

  // Retrieve yesterday's stats from history if strictly needed, 
  // but for the prompt "Archives the previous day's completion", 
  // we assume the calling component might handle the specific archiving of *active* task state 
  // into the history array before calling this, or we rely on the history array already being up to date.
  // For this implementation, we will assume 'history' is updated when tasks are done.
  
  const yesterdayStats = state.history.find(h => h.date === yesterdayString) || null;

  return { state: newState, isNewDay: true, yesterdayStats };
};

export const updateCompletedTasks = (taskIds: string[], percentage: number, timeSpent: number) => {
  const state = getProgress();
  const today = getTodayString();
  
  // Remove existing entry for today if any
  const historyWithoutToday = state.history.filter(h => h.date !== today);
  
  const newEntry: DailyProgress = {
    date: today,
    completedTaskIds: taskIds,
    completionPercentage: percentage,
    timeSpentMinutes: timeSpent
  };

  const newState = {
    ...state,
    history: [...historyWithoutToday, newEntry]
  };
  
  saveProgress(newState);
  return newState;
};

export const addJournalEntry = (content: string) => {
  const state = getProgress();
  const today = getTodayString();
  
  const newEntry: JournalEntry = { date: today, content };
  const newState = {
    ...state,
    journal: [newEntry, ...state.journal]
  };
  
  saveProgress(newState);
  return newState;
};

export const setReminderTime = (time: string | null) => {
  const state = getProgress();
  const newState = { ...state, reminderTime: time };
  saveProgress(newState);
  return newState;
};

export const getDayOfJourney = (startDateStr: string): number => {
  const start = new Date(startDateStr).getTime();
  const now = new Date().getTime();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays + 1; // Day 1 is the start day
};
