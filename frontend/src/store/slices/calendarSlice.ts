import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { calendarApi } from '../../services/api/calendar.api';
import { CalendarState, CalendarEvent, CalendarViewMode } from '../../types';

const today = new Date().toISOString().split('T')[0];

const initialState: CalendarState = {
  events: [], selectedDate: today, viewMode: 'month',
  isLoading: false, isSubmitting: false, error: null,
};

export const fetchEvents = createAsyncThunk('calendar/fetch',
  async (month: string, { rejectWithValue }) => {
    try { return await calendarApi.getEvents(month); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const createEventThunk = createAsyncThunk('calendar/create',
  async (event: Omit<CalendarEvent, 'id'>, { rejectWithValue }) => {
    try { return await calendarApi.createEvent(event); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const updateEventThunk = createAsyncThunk('calendar/update',
  async (event: CalendarEvent, { rejectWithValue }) => {
    try { return await calendarApi.updateEvent(event); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const deleteEventThunk = createAsyncThunk('calendar/delete',
  async (id: string, { rejectWithValue }) => {
    try { await calendarApi.deleteEvent(id); return id; }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

const calendarSlice = createSlice({
  name: 'calendar', initialState,
  reducers: {
    setSelectedDate: (s, a: PayloadAction<string>) => { s.selectedDate = a.payload; },
    setViewMode: (s, a: PayloadAction<CalendarViewMode>) => { s.viewMode = a.payload; },
    clearError: s => { s.error = null; },
  },
  extraReducers: b => {
    b.addCase(fetchEvents.pending, s => { s.isLoading = true; });
    b.addCase(fetchEvents.fulfilled, (s, a) => { s.isLoading = false; s.events = a.payload; });
    b.addCase(fetchEvents.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    b.addCase(createEventThunk.fulfilled, (s, a) => { s.isSubmitting = false; s.events.push(a.payload); });
    b.addCase(updateEventThunk.fulfilled, (s, a) => {
      const idx = s.events.findIndex(e => e.id === a.payload.id);
      if (idx >= 0) s.events[idx] = a.payload;
    });
    b.addCase(deleteEventThunk.fulfilled, (s, a) => {
      s.events = s.events.filter(e => e.id !== a.payload);
    });
  },
});

export const { setSelectedDate, setViewMode, clearError } = calendarSlice.actions;
export default calendarSlice.reducer;
