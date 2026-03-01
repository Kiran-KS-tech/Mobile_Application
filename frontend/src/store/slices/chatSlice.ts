import { createSlice, createAsyncThunk, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { chatApi } from '../../services/api/chat.api';
import { ChatState, Message } from '../../types';

const initialState: ChatState = {
  messages: [], isTyping: false, isLoading: false, isSending: false, error: null, sessionId: null,
};

export const fetchChatHistory = createAsyncThunk('chat/history',
  async (_, { rejectWithValue }) => {
    try { return await chatApi.getHistory(); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const sendMessageThunk = createAsyncThunk('chat/send',
  async (content: string, { rejectWithValue }) => {
    try { return await chatApi.sendMessage(content); }
    catch (e: any) { return rejectWithValue(e.message); }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addOptimisticMessage: (s, a: PayloadAction<string>) => {
      const msg: Message = {
        _id: nanoid(), content: a.payload, role: 'user',
        timestamp: new Date().toISOString(),
      };
      s.messages.push(msg);
    },
    setTyping: (s, a: PayloadAction<boolean>) => { s.isTyping = a.payload; },
    clearError: s => { s.error = null; },
    clearChat: s => { s.messages = []; },
  },
  extraReducers: b => {
    b.addCase(fetchChatHistory.pending, s => { s.isLoading = true; });
    b.addCase(fetchChatHistory.fulfilled, (s, a) => { s.isLoading = false; s.messages = a.payload; });
    b.addCase(fetchChatHistory.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    b.addCase(sendMessageThunk.pending, s => { s.isSending = true; s.isTyping = true; });
    b.addCase(sendMessageThunk.fulfilled, (s, a) => {
      s.isSending = false; s.isTyping = false;
      // replace optimistic + add AI reply
      const last = s.messages[s.messages.length - 1];
      if (last?.role === 'user') s.messages[s.messages.length - 1] = a.payload.userMessage;
      else s.messages.push(a.payload.userMessage);
      s.messages.push(a.payload.aiMessage);
    });
    b.addCase(sendMessageThunk.rejected, (s, a) => {
      s.isSending = false; s.isTyping = false; s.error = a.payload as string;
    });
  },
});

export const { addOptimisticMessage, setTyping, clearError, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
