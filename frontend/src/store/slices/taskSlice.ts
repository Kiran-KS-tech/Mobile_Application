import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskApi } from '../../services/api/task.api';
import { TaskState, Task, Priority } from '../../types';

const initialState: TaskState = {
  tasks: [], filter: 'all', isLoading: false, isSubmitting: false, error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetch',
  async (_, { rejectWithValue }) => {
    try { return await taskApi.getTasks(); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const createTaskThunk = createAsyncThunk('tasks/create',
  async (task: Omit<Task, 'id' | 'createdAt' | 'completed'>, { rejectWithValue }) => {
    try { return await taskApi.createTask(task); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const toggleTaskThunk = createAsyncThunk('tasks/toggle',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = (getState() as any).tasks as TaskState;
      const task = state.tasks.find(t => t.id === id)!;
      return await taskApi.updateTask({ ...task, completed: !task.completed });
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const deleteTaskThunk = createAsyncThunk('tasks/delete',
  async (id: string, { rejectWithValue }) => {
    try { await taskApi.deleteTask(id); return id; }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

const taskSlice = createSlice({
  name: 'tasks', initialState,
  reducers: {
    setFilter: (s, a: PayloadAction<TaskState['filter']>) => { s.filter = a.payload; },
    clearError: s => { s.error = null; },
  },
  extraReducers: b => {
    b.addCase(fetchTasks.pending, s => { s.isLoading = true; });
    b.addCase(fetchTasks.fulfilled, (s, a) => { s.isLoading = false; s.tasks = a.payload; });
    b.addCase(fetchTasks.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    b.addCase(createTaskThunk.fulfilled, (s, a) => { s.tasks.unshift(a.payload); });
    b.addCase(toggleTaskThunk.fulfilled, (s, a) => {
      const idx = s.tasks.findIndex(t => t.id === a.payload.id);
      if (idx >= 0) s.tasks[idx] = a.payload;
    });
    b.addCase(deleteTaskThunk.fulfilled, (s, a) => {
      s.tasks = s.tasks.filter(t => t.id !== a.payload);
    });
  },
});

export const { setFilter, clearError } = taskSlice.actions;
export default taskSlice.reducer;
