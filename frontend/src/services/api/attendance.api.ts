import { axiosInstance } from './axios.instance';

export interface TimerRecord {
  _id: string;
  userId: any;
  checkInTime: string;
  checkOutTime: string;
  duration: number;
  dateString: string;
}

export const attendanceApi = {
  checkIn: async (): Promise<{ message: string; timer: TimerRecord }> => {
    const { data } = await axiosInstance.post('/attendance/check-in');
    return data;
  },
  checkOut: async (): Promise<{ message: string; timer: TimerRecord }> => {
    const { data } = await axiosInstance.put('/attendance/check-out');
    return data;
  },
  getMyRecords: async (): Promise<TimerRecord[]> => {
    const { data } = await axiosInstance.get('/attendance/my-records');
    return data;
  },
  getAllRecords: async (date?: string): Promise<TimerRecord[]> => {
    const { data } = await axiosInstance.get(`/attendance/all-records${date ? `?date=${date}` : ''}`);
    return data;
  },
  getUserRecords: async (userId: string): Promise<TimerRecord[]> => {
    const { data } = await axiosInstance.get(`/attendance/user/${userId}`);
    return data;
  },
};
