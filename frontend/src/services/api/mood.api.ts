import { axiosInstance } from './axios.instance';
import { MoodLog, WeeklyMoodPoint } from '../../types';

export const moodApi = {
  getLogs: async (): Promise<MoodLog[]> => {
    const { data } = await axiosInstance.get('/mood/history');
    return data;
  },
  submitLog: async (log: Omit<MoodLog, 'id' | 'timestamp'>): Promise<MoodLog> => {
    const { data } = await axiosInstance.post('/mood/log', log);
    return data;
  },
  getWeeklyAnalytics: async (): Promise<WeeklyMoodPoint[]> => {
    const { data } = await axiosInstance.get('/mood/analytics');
    return data;
  },

};
