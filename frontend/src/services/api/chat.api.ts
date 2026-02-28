import { axiosInstance } from './axios.instance';
import { Message } from '../../types';

export const chatApi = {
  getHistory: async (): Promise<Message[]> => {
    const { data } = await axiosInstance.get('/chat/history');
    return data;
  },
  sendMessage: async (content: string): Promise<{ userMessage: Message; aiMessage: Message }> => {
    const { data } = await axiosInstance.post('/chat/message', { content });
    return data;
  },
  clearHistory: async (): Promise<void> => {
    await axiosInstance.delete('/chat/history');
  },
};
