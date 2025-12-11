export interface UserInput {
  goal: string;
  context: string; // Additional details like struggles, timeline
  images: File[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'tool';
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  duration?: string;
}

export interface DailyPlan {
  day: number;
  title: string; // e.g., "Foundations of React"
  focus: string;
  tasks: Task[];
  resources: Resource[];
}

export interface WeeklySummary {
  week: number;
  theme: string;
  objectives: string[];
  checkpoint: string; // Self-assessment task
}

export interface Challenge {
  problem: string;
  solution: string;
}

export interface Phase {
  name: string;
  duration: string;
  description: string;
}

export interface Roadmap {
  title: string;
  overview: string;
  currentLevelEstimate: string;
  timelineEstimate: string;
  phases: Phase[];
  dailyPlans: DailyPlan[];
  weeklySummaries: WeeklySummary[];
  predictedChallenges: Challenge[];
}

export type AppState = 'LANDING' | 'INPUT' | 'LOADING' | 'RESULT';

// --- NEW TYPES FOR PROGRESS SYSTEM ---

export interface JournalEntry {
  date: string;
  content: string;
}

export interface DailyProgress {
  date: string;
  completedTaskIds: string[];
  completionPercentage: number;
  timeSpentMinutes: number;
}

export interface UserProgressState {
  roadmapStartDate: string; // ISO string
  lastVisitDate: string; // YYYY-MM-DD
  currentStreak: number;
  maxStreak: number;
  reminderTime: string | null; // "HH:MM" 24h format
  journal: JournalEntry[];
  history: DailyProgress[]; // Archive of past days
}
