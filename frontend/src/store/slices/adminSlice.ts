import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api/admin.api';
import { AdminState } from '../../types';

const initialState: AdminState = {
  burnoutRisks: [],
  isLoading: false,
  error: null,
};

export const fetchBurnoutRisks = createAsyncThunk(
  'admin/fetchBurnoutRisks',
  async (_, { rejectWithValue }) => {
    try {
      return await adminApi.getBurnoutRisks();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch burnout risks');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBurnoutRisks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBurnoutRisks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.burnoutRisks = action.payload;
      })
      .addCase(fetchBurnoutRisks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
