import { axiosInstance } from './axios.instance';

export interface LeaveRecord {
  _id: string;
  userId: any;
  leaveType: 'medical' | 'casual' | 'unpaid';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  startDate: string;
  endDate: string;
  appliedAt: string;
}

export const leaveApi = {
  applyLeave: async (payload: { leaveType: string; reason: string; startDate: string; endDate: string }): Promise<{ message: string; leave: LeaveRecord }> => {
    const { data } = await axiosInstance.post('/leave/apply', payload);
    return data;
  },
  getPendingLeaves: async (): Promise<LeaveRecord[]> => {
    const { data } = await axiosInstance.get('/leave/pending');
    return data;
  },
  updateLeaveStatus: async (id: string, status: 'approved' | 'rejected'): Promise<{ message: string; leave: LeaveRecord }> => {
    const { data } = await axiosInstance.put(`/leave/${id}/status`, { status });
    return data;
  },
  getMyLeaves: async (): Promise<LeaveRecord[]> => {
    const { data } = await axiosInstance.get('/leave/my-leaves');
    return data;
  },
};
