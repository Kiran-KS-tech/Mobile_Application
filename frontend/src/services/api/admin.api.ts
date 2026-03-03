import { axiosInstance } from './axios.instance';
import { BurnoutRisk } from '../../types';

export const adminApi = {
  getBurnoutRisks: async (): Promise<BurnoutRisk[]> => {
    const response = await axiosInstance.get('/ai/admin/burnout-risk');
    return response.data;
  },
};
