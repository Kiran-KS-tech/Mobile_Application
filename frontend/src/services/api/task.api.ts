import { axiosInstance } from './axios.instance';
import { Task } from '../../types';

export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    const { data } = await axiosInstance.get('/tasks');
    return data;
  },
  createTask: async (task: Omit<Task, '_id' | 'createdAt' | 'completed'>): Promise<Task> => {
    const { data } = await axiosInstance.post('/tasks', task);
    return data;
  },
  updateTask: async (task: Task): Promise<Task> => {
    const { data } = await axiosInstance.put(`/tasks/${task._id}`, task);
    return data;
  },
  deleteTask: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/tasks/${id}`);
  },
};
