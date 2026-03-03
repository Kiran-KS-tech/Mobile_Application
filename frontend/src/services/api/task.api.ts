import { axiosInstance } from './axios.instance';
import { Task } from '../../types';

export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    const { data } = await axiosInstance.get('/tasks');
    // Map backend 'id' to '_id' for frontend consistency
    return data.map((t: any) => ({ ...t, _id: t._id || t.id }));
  },
  createTask: async (task: Omit<Task, '_id' | 'createdAt' | 'completed'>): Promise<Task> => {
    const { data } = await axiosInstance.post('/tasks', task);
    // Map backend 'id' to '_id' for frontend consistency
    return { ...data, _id: data._id || data.id };
  },
  updateTask: async (task: Task): Promise<Task> => {
    // Backend uses 'id' for URL params but we use '_id' in frontend state
    const { data } = await axiosInstance.put(`/tasks/${task._id}`, task);
    return { ...data, _id: data._id || data.id };
  },
  deleteTask: async (id: string): Promise<void> => {
    // Backend expects taskId from URL
    await axiosInstance.delete(`/tasks/${id}`);
  },
};
