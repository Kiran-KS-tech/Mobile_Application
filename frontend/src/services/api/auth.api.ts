import { axiosInstance } from './axios.instance';
import { User } from '../../types';

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    return data;
  },
  register: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
    const { data } = await axiosInstance.post('/auth/register', { name, email, password });
    return data;
  },
  getProfile: async (): Promise<User> => {
    const { data } = await axiosInstance.get('/auth/profile');
    return data.user;
  },
  updateProfile: async (updates: Partial<User>): Promise<{ token: string; user: User }> => {
    const { data } = await axiosInstance.put('/auth/update', updates);
    return data;
  },
  logout: async (): Promise<void> => {
    // Backend is stateless, logout is handled on frontend by clearing token
    return Promise.resolve();
  },
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await axiosInstance.get('/auth/all-users');
    return data;
  },
};
