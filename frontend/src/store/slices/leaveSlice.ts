import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leaveApi, LeaveRecord } from '../../services/api/leave.api';

interface LeaveState {
  myLeaves: LeaveRecord[];
  pendingLeaves: LeaveRecord[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LeaveState = {
  myLeaves: [],
  pendingLeaves: [],
  isLoading: false,
  error: null,
};

export const fetchMyLeaves = createAsyncThunk('leave/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await leaveApi.getMyLeaves();
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch leaves');
    }
  }
);

export const applyLeaveThunk = createAsyncThunk('leave/apply',
  async (p: { leaveType: string; reason: string; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      return await leaveApi.applyLeave(p);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Apply leave failed');
    }
  }
);

export const fetchPendingLeaves = createAsyncThunk('leave/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      return await leaveApi.getPendingLeaves();
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch pending leaves');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    clearLeaveError: s => { s.error = null; }
  },
  extraReducers: b => {
    b.addCase(fetchMyLeaves.pending, s => { s.isLoading = true; });
    b.addCase(fetchMyLeaves.fulfilled, (s, a) => { s.isLoading = false; s.myLeaves = a.payload; });
    b.addCase(fetchMyLeaves.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    b.addCase(applyLeaveThunk.pending, s => { s.isLoading = true; });
    b.addCase(applyLeaveThunk.fulfilled, (s, a) => {
      s.isLoading = false;
      s.myLeaves = [a.payload.leave, ...s.myLeaves];
    });
    b.addCase(applyLeaveThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    b.addCase(fetchPendingLeaves.pending, s => { s.isLoading = true; });
    b.addCase(fetchPendingLeaves.fulfilled, (s, a) => { s.isLoading = false; s.pendingLeaves = a.payload; });
    b.addCase(fetchPendingLeaves.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export const { clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
