import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceApi, TimerRecord } from '../../services/api/attendance.api';

interface AttendanceState {
  myRecords: TimerRecord[];
  allRecords: any[]; // Changed to any[] as it now contains aggregated data
  userRecords: TimerRecord[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  myRecords: [],
  allRecords: [],
  userRecords: [],
  isLoading: false,
  error: null,
};

export const fetchMyRecords = createAsyncThunk('attendance/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await attendanceApi.getMyRecords();
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch records');
    }
  }
);

export const fetchAllRecords = createAsyncThunk('attendance/fetchAll',
  async (date: string | undefined, { rejectWithValue }) => {
    try {
      return await attendanceApi.getAllRecords(date);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch all records');
    }
  }
);

export const fetchUserRecords = createAsyncThunk('attendance/fetchUserRecords',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await attendanceApi.getUserRecords(userId);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch user records');
    }
  }
);

export const checkInThunk = createAsyncThunk('attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      return await attendanceApi.checkIn();
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Check-in failed');
    }
  }
);

export const checkOutThunk = createAsyncThunk('attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      return await attendanceApi.checkOut();
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Check-out failed');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: s => { s.error = null; }
  },
  extraReducers: b => {
    b.addCase(fetchMyRecords.pending, s => { s.isLoading = true; });
    b.addCase(fetchMyRecords.fulfilled, (s, a) => { s.isLoading = false; s.myRecords = a.payload; });
    b.addCase(fetchMyRecords.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    b.addCase(fetchAllRecords.pending, s => { s.isLoading = true; });
    b.addCase(fetchAllRecords.fulfilled, (s, a) => { s.isLoading = false; s.allRecords = a.payload; });
    b.addCase(fetchAllRecords.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    b.addCase(checkInThunk.pending, s => { s.isLoading = true; });
    b.addCase(checkInThunk.fulfilled, (s, a) => {
      s.isLoading = false;
      // After check-in, we might want to refresh records or just add the new one
      // The API returns { message, timer }
      s.myRecords = [a.payload.timer, ...s.myRecords.filter(r => r._id !== a.payload.timer._id)];
    });
    b.addCase(checkInThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    b.addCase(checkOutThunk.fulfilled, (s, a) => {
      s.isLoading = false;
      s.myRecords = s.myRecords.map(r => r._id === a.payload.timer._id ? a.payload.timer : r);
    });
    b.addCase(checkOutThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    b.addCase(fetchUserRecords.pending, s => { s.isLoading = true; });
    b.addCase(fetchUserRecords.fulfilled, (s, a) => { s.isLoading = false; s.userRecords = a.payload; });
    b.addCase(fetchUserRecords.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export const { clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
