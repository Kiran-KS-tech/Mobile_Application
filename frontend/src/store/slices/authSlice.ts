import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../../services/api/auth.api';
import { AuthState, User } from '../../types';

const initialState: AuthState = {
  user: null, users: [], token: null,
  isLoading: false, isRestoring: true, error: null,
};

export const loginThunk = createAsyncThunk('auth/login',
  async (p: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.login(p.email, p.password);
      await SecureStore.setItemAsync('calmx_token', res.token);
      return res;
    } catch (e: any) { return rejectWithValue(e?.response?.data?.message || 'Login failed'); }
  }
);

export const registerThunk = createAsyncThunk('auth/register',
  async (p: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.register(p.name, p.email, p.password);
      await SecureStore.setItemAsync('calmx_token', res.token);
      return res;
    } catch (e: any) { return rejectWithValue(e?.response?.data?.message || 'Registration failed'); }
  }
);

export const restoreSessionThunk = createAsyncThunk('auth/restore',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync('calmx_token');
      if (!token) throw new Error('no_token');
      const user = await authApi.getProfile();
      return { token, user };
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await SecureStore.deleteItemAsync('calmx_token');
});

export const updateProfileThunk = createAsyncThunk('auth/updateProfile',
  async (updates: Partial<User>, { rejectWithValue }) => {
    try {
      const res = await authApi.updateProfile(updates);
      if (res.token) {
        await SecureStore.setItemAsync('calmx_token', res.token);
      }
      return res;
    } catch (e: any) { return rejectWithValue(e?.response?.data?.message || 'Update failed'); }
  }
);

export const fetchAllUsersThunk = createAsyncThunk('auth/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.getAllUsers();
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message || 'Failed to fetch users');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: s => { s.error = null; },
    updateUser: (s, a: PayloadAction<Partial<User>>) => {
      if (s.user) s.user = { ...s.user, ...a.payload };
    },
  },
  extraReducers: b => {
    // login
    b.addCase(loginThunk.pending, s => { s.isLoading = true; s.error = null; });
    b.addCase(loginThunk.fulfilled, (s, a) => { s.isLoading = false; s.token = a.payload.token; s.user = a.payload.user; });
    b.addCase(loginThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    // register
    b.addCase(registerThunk.pending, s => { s.isLoading = true; s.error = null; });
    b.addCase(registerThunk.fulfilled, (s, a) => { s.isLoading = false; s.token = a.payload.token; s.user = a.payload.user; });
    b.addCase(registerThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    // restore
    b.addCase(restoreSessionThunk.pending, s => { s.isRestoring = true; });
    b.addCase(restoreSessionThunk.fulfilled, (s, a) => { s.isRestoring = false; s.token = a.payload.token; s.user = a.payload.user; });
    b.addCase(restoreSessionThunk.rejected, s => { s.isRestoring = false; });
    // logout
    b.addCase(logoutThunk.fulfilled, s => { s.user = null; s.token = null; s.users = []; });
    // fetchAllUsers
    b.addCase(fetchAllUsersThunk.pending, s => { s.isLoading = true; });
    b.addCase(fetchAllUsersThunk.fulfilled, (s, a) => { s.isLoading = false; s.users = a.payload; });
    b.addCase(fetchAllUsersThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    // updateProfile
    b.addCase(updateProfileThunk.pending, s => { s.isLoading = true; s.error = null; });
    b.addCase(updateProfileThunk.fulfilled, (s, a) => {
      s.isLoading = false;
      if (a.payload.token) s.token = a.payload.token;
      s.user = a.payload.user;
    });
    b.addCase(updateProfileThunk.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
