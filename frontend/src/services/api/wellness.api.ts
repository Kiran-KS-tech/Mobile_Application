import { axiosInstance } from './axios.instance';
import { WellnessSummary } from '../../types';

export const wellnessApi = {
  getSummary: async (): Promise<WellnessSummary> => {
    const { data } = await axiosInstance.get('/wellness/summary');
    return data;
  },
  getInsights: async (): Promise<{ insights: string[] }> => {
    const { data } = await axiosInstance.get('/wellness/insights');
    return data;
  },
  getBurnoutRisk: async (): Promise<{ riskLevel: string; factors: string[] }> => {
    const { data } = await axiosInstance.get('/wellness/burnout-risk');
    return data;
  },
};
