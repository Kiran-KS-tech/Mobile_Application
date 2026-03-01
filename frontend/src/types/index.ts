// ── Auth ──────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  medicalLeaves: number;
  casualLeaves: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  users: User[]; // Add this
  token: string | null;
  isLoading: boolean;
  isRestoring: boolean;
  error: string | null;
}

// ── Mood ──────────────────────────────────────────────────────
export type MoodType = 'great' | 'good' | 'okay' | 'low' | 'awful';
export type MoodNumeric = 5 | 4 | 3 | 2 | 1;

export interface MoodLog {
  _id: string;
  mood: MoodType;
  moodScore: MoodNumeric;
  stressLevel: number;    // 0–10
  energyLevel: number;    // 0–10
  note?: string;
  timestamp: string;
}

export interface WeeklyMoodPoint {
  day: string;            // e.g. 'Mon'
  date: string;
  moodScore: number;      // 1–5
  stressLevel: number;    // 0–10
  energyLevel: number;    // 0–10
}

export interface MoodState {
  logs: MoodLog[];
  todayLog: MoodLog | null;
  weeklyData: WeeklyMoodPoint[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ── Chat ──────────────────────────────────────────────────────
export interface Message {
  _id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sessionId: string | null;
}

// ── Calendar ──────────────────────────────────────────────────
export type EventType = 'meeting' | 'task' | 'focus' | 'break';
export type CalendarViewMode = 'month' | 'day';

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  type: EventType;
  startTime: string;      // ISO string
  endTime: string;        // ISO string
  date: string;           // YYYY-MM-DD
  hasConflict?: boolean;
  workloadScore?: number; // 0–100
  location?: string;
}

export interface CalendarState {
  events: CalendarEvent[];
  selectedDate: string;   // YYYY-MM-DD
  viewMode: CalendarViewMode;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ── Tasks ─────────────────────────────────────────────────────
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  deadline?: string;
  smartScore?: number;    // 0–100 AI-prioritized score
  tags?: string[];
  estimatedMinutes?: number;
  createdAt: string;
}

export interface TaskState {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// ── Focus ─────────────────────────────────────────────────────
export type TimerStatus = 'idle' | 'running' | 'paused' | 'break';
export type SessionType = 'focus' | 'short_break' | 'long_break';

export interface FocusSession {
  _id: string;
  duration: number;       // seconds
  type: SessionType;
  completedAt: string;
}

export interface FocusState {
  status: TimerStatus;
  timeRemaining: number;  // seconds
  currentRound: number;   // 1..4 before long break
  streak: number;         // consecutive focus sessions today
  totalFocusToday: number;// minutes
  sessions: FocusSession[];
  focusDuration: number;  // default 25 min
  shortBreakDuration: number;
  longBreakDuration: number;
  isLoading: boolean;
}

// ── Wellness ──────────────────────────────────────────────────
export type MoodTrend = 'improving' | 'stable' | 'declining';

export interface WellnessSummary {
  burnoutRisk: number;    // 0–100
  workloadScore: number;  // 0–100
  focusHours: number;
  moodTrend: MoodTrend;
  streakDays: number;
  upcomingEvents: CalendarEvent[];
  weeklyHighlight?: string;
}

export interface WellnessState {
  summary: WellnessSummary | null;
  isLoading: boolean;
  error: string | null;
}

// ── Navigation ────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Chat:      undefined;
  Calendar:  undefined;
  Tasks:     undefined;
  Focus:     undefined;
  Profile:   undefined;
};

export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminAttendance: undefined;
  AdminHolidays: undefined;
  AdminLeaves: undefined;
  AdminUsers: undefined; // Add this
};
