import { axiosInstance } from './axios.instance';
import { MoodLog, WeeklyMoodPoint } from '../../types';

export const moodApi = {
  getLogs: async (): Promise<MoodLog[]> => {
    const { data } = await axiosInstance.get('/mood/history');
    return data;
  },
  submitLog: async (log: { score: number; note?: string; meetingDensity: number; energyLevel: number }): Promise<MoodLog> => {
    const { data } = await axiosInstance.post('/mood/log', log);
    return data;
  },
  getWeeklyAnalytics: async (): Promise<WeeklyMoodPoint[]> => {
    const { data } = await axiosInstance.get('/mood/analytics');
    
    if (!data || !data.weeklyTrend) return [];

    return data.weeklyTrend.map((item: any) => {
      const dateObj = new Date(item.date);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      return {
        day: days[dateObj.getDay()],
        date: item.date,
        moodScore: item.averageScore / 20, // Mapping back to 1-5 scale
        stressLevel: item.stressDistribution.high * 10, // Placeholder mapping
        energyLevel: 5 // Default as backend doesn't provide it
      };
    });
  },
  deleteLog: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/mood/${id}`);
  },
  getMoodFeedback: async (moodData: any): Promise<{ feedback: string }> => {
    const { data } = await axiosInstance.post('/ai/mood-feedback', moodData);
    return data;
  },
};
