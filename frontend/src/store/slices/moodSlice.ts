import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { moodApi } from '../../services/api/mood.api';
import { MoodState, MoodLog } from '../../types';

const initialState: MoodState = {
  logs: [], todayLog: null, weeklyData: [], isLoading: false, isSubmitting: false, error: null,
};

export const fetchMoodLogs = createAsyncThunk('mood/fetchLogs',
  async (_, { rejectWithValue }) => {
    try { return await moodApi.getLogs(); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const submitMoodLogThunk = createAsyncThunk('mood/submit',
  async (log: { score: number; note?: string; meetingDensity: number; energyLevel: number }, { rejectWithValue }) => {
    try { return await moodApi.submitLog(log); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const fetchWeeklyMood = createAsyncThunk('mood/weekly',
  async (_, { rejectWithValue }) => {
    try { return await moodApi.getWeeklyAnalytics(); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

const isTodayFn = (ts: string) => new Date(ts).toDateString() === new Date().toDateString();

const moodSlice = createSlice({
  name: 'mood', initialState,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: b => {
    b.addCase(fetchMoodLogs.pending, s => { s.isLoading = true; });
    b.addCase(fetchMoodLogs.fulfilled, (s, a) => {
      s.isLoading = false; s.logs = a.payload;
      s.todayLog = a.payload.find((l: MoodLog) => isTodayFn(l.timestamp)) ?? null;
    });
    b.addCase(fetchMoodLogs.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    b.addCase(submitMoodLogThunk.pending, s => { s.isSubmitting = true; });
    b.addCase(submitMoodLogThunk.fulfilled, (s, a) => {
      s.isSubmitting = false; s.todayLog = a.payload; s.logs.unshift(a.payload);
    });
    b.addCase(submitMoodLogThunk.rejected, (s, a) => { s.isSubmitting = false; s.error = a.payload as string; });

    b.addCase(fetchWeeklyMood.fulfilled, (s, a) => { s.weeklyData = a.payload; });
  },
});

export const { clearError } = moodSlice.actions;
export default moodSlice.reducer;
