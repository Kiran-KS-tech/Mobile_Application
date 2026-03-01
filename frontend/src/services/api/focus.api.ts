import { axiosInstance } from './axios.instance';
import { FocusSession } from '../../types';

export const focusApi = {
  getSessions: async (): Promise<FocusSession[]> => {
    const { data } = await axiosInstance.get('/focus/sessions');
    return data;
  },
  logSession: async (session: Omit<FocusSession, '_id'>): Promise<FocusSession> => {
    const { data } = await axiosInstance.post('/focus/sessions', session);
    return data;
  },
  getStreak: async (): Promise<{ streak: number }> => {
    const { data } = await axiosInstance.get('/focus/streak');
    return data;
  },
};
