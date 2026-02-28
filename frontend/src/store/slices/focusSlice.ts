import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { focusApi } from '../../services/api/focus.api';
import { FocusState, FocusSession, TimerStatus, SessionType } from '../../types';

const DEFAULT_FOCUS = 25 * 60;
const DEFAULT_SHORT = 5 * 60;
const DEFAULT_LONG  = 15 * 60;

const initialState: FocusState = {
  status: 'idle',
  timeRemaining: DEFAULT_FOCUS,
  currentRound: 1,
  streak: 0,
  totalFocusToday: 0,
  sessions: [],
  focusDuration: DEFAULT_FOCUS,
  shortBreakDuration: DEFAULT_SHORT,
  longBreakDuration: DEFAULT_LONG,
  isLoading: false,
};

export const fetchFocusSessions = createAsyncThunk('focus/fetchSessions',
  async (_, { rejectWithValue }) => {
    try { return await focusApi.getSessions(); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const logSessionThunk = createAsyncThunk('focus/logSession',
  async (session: Omit<FocusSession, 'id'>, { rejectWithValue }) => {
    try { return await focusApi.logSession(session); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

const focusSlice = createSlice({
  name: 'focus', initialState,
  reducers: {
    startTimer:  s => { s.status = 'running'; },
    pauseTimer:  s => { s.status = 'paused'; },
    resetTimer:  s => { s.status = 'idle'; s.timeRemaining = s.focusDuration; },
    tick: s => { if (s.timeRemaining > 0) s.timeRemaining -= 1; },
    sessionComplete: (s, a: PayloadAction<SessionType>) => {
      if (a.payload === 'focus') {
        s.streak += 1;
        s.totalFocusToday += Math.round(s.focusDuration / 60);
        const isLongBreak = s.currentRound % 4 === 0;
        s.status = 'break';
        s.timeRemaining = isLongBreak ? s.longBreakDuration : s.shortBreakDuration;
        s.currentRound += 1;
      } else {
        s.status = 'idle';
        s.timeRemaining = s.focusDuration;
      }
    },
    setDurations: (s, a: PayloadAction<{ focus?: number; short?: number; long?: number }>) => {
      if (a.payload.focus)  { s.focusDuration = a.payload.focus * 60; s.timeRemaining = a.payload.focus * 60; }
      if (a.payload.short)  s.shortBreakDuration = a.payload.short * 60;
      if (a.payload.long)   s.longBreakDuration = a.payload.long * 60;
    },
  },
  extraReducers: b => {
    b.addCase(fetchFocusSessions.pending, s => { s.isLoading = true; });
    b.addCase(fetchFocusSessions.fulfilled, (s, a) => {
      s.isLoading = false; s.sessions = a.payload;
      const todayStr = new Date().toDateString();
      s.totalFocusToday = a.payload
        .filter((sess: FocusSession) => new Date(sess.completedAt).toDateString() === todayStr && sess.type === 'focus')
        .reduce((sum: number, sess: FocusSession) => sum + Math.round(sess.duration / 60), 0);
    });
    b.addCase(logSessionThunk.fulfilled, (s, a) => { s.sessions.unshift(a.payload); });
  },
});

export const { startTimer, pauseTimer, resetTimer, tick, sessionComplete, setDurations } = focusSlice.actions;
export default focusSlice.reducer;
