import { axiosInstance } from './axios.instance';

export interface HolidayRecord {
  _id: string;
  name: string;
  date: string;
}

export const holidayApi = {
  createHoliday: async (name: string, date: string): Promise<{ message: string; holiday: HolidayRecord }> => {
    const { data } = await axiosInstance.post('/holidays', { name, date });
    return data;
  },
  getHolidays: async (): Promise<HolidayRecord[]> => {
    const { data } = await axiosInstance.get('/holidays');
    return data;
  },
  deleteHoliday: async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/holidays/${id}`);
    return data;
  },
};
