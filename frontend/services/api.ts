import axios from 'axios';
import { Task, TaskFilters } from '../types';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskify_token');
      localStorage.removeItem('taskify_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data.payload;
  },
  
  signup: async (username: string, password: string) => {
    const response = await api.post('/auth/signup', { username, password });
    return response.data.payload;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('taskify_token');
    localStorage.removeItem('taskify_user');
  },
};

export const userService = {
  getUsers: async (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const response = await api.get(`/auth/users?${params.toString()}`);
    return response.data.payload;
  }
};

export const taskService = {
  getTasks: async (filters?: TaskFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.userId) params.append('userId', filters.userId);
      if (typeof filters.all === 'boolean') params.append('all', filters.all.toString());
    }
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data.payload;
  },
  
  getTaskById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.payload;
  },
  
  createTask: async (task: Partial<Task>) => {
    const response = await api.post('/tasks', task);
    return response.data.payload;
  },
  
  updateTask: async (id: string, task: Partial<Task>) => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data.payload;
  },
  
  deleteTask: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },
  
  assignTask: async (taskId: string, userId: string) => {
    const response = await api.post(`/tasks/${taskId}/assign`, { userId });
    return response.data.payload;
  },
};

export default api;