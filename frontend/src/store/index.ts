import { configureStore } from '@reduxjs/toolkit';
import authReducer      from './slices/authSlice';
import chatReducer      from './slices/chatSlice';
import moodReducer      from './slices/moodSlice';
import calendarReducer  from './slices/calendarSlice';
import taskReducer      from './slices/taskSlice';
import focusReducer     from './slices/focusSlice';
import wellnessReducer  from './slices/wellnessSlice';
import attendanceReducer from './slices/attendanceSlice';
import leaveReducer      from './slices/leaveSlice';

export const store = configureStore({
  reducer: {
    auth:       authReducer,
    chat:       chatReducer,
    mood:       moodReducer,
    calendar:   calendarReducer,
    tasks:      taskReducer,
    focus:      focusReducer,
    wellness:   wellnessReducer,
    attendance: attendanceReducer,
    leave:      leaveReducer,
  },
  middleware: g => g({ serializableCheck: false }),
});

export type RootState    = ReturnType<typeof store.getState>;
export type AppDispatch  = typeof store.dispatch;
