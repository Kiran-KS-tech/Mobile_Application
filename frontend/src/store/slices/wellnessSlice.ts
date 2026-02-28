import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wellnessApi } from '../../services/api/wellness.api';
import { WellnessState } from '../../types';

const initialState: WellnessState = { summary: null, isLoading: false, error: null };

export const fetchWellnessSummary = createAsyncThunk('wellness/fetch',
  async (_, { rejectWithValue }) => {
    try { return await wellnessApi.getSummary(); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

const wellnessSlice = createSlice({
  name: 'wellness', initialState,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: b => {
    b.addCase(fetchWellnessSummary.pending, s => { s.isLoading = true; });
    b.addCase(fetchWellnessSummary.fulfilled, (s, a) => { s.isLoading = false; s.summary = a.payload; });
    b.addCase(fetchWellnessSummary.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export const { clearError } = wellnessSlice.actions;
export default wellnessSlice.reducer;
