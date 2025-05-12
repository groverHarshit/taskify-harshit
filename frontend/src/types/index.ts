export interface User {
  id: string;
  username: string;
  token: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  unassigned: boolean;
  createdBy: string;
  userId: string;
  user?: {
    username: string;
    _id: string;
  };
  createdUser?: {
    username: string;
    _id: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  userId?: string;
  all?: boolean;
}