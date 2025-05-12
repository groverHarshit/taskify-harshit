import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, SignupCredentials } from '../types';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in localStorage on initial load
    const storedUser = localStorage.getItem('taskify_user');
    const storedToken = localStorage.getItem('taskify_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const data = await authService.login(credentials.username, credentials.password);
      
      // Check if we have a token in the response
      if (!data?.token || typeof data.token !== 'string') {
        throw new Error('Invalid authentication token');
      }

      // Create user data from credentials since API only returns token
      const userData = {
        id: 'temp-id', // This will be replaced when we fetch user data
        username: credentials.username,
        token: data.token
      };
      
      localStorage.setItem('taskify_token', data.token);
      localStorage.setItem('taskify_user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('Login successful!');
      navigate('/tasks');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      setLoading(true);
      const data = await authService.signup(credentials.username, credentials.password);
      
      // Check if we have a token in the response
      if (!data?.token || typeof data.token !== 'string') {
        throw new Error('Invalid authentication token');
      }
      
      // Create user data from credentials since API only returns token
      const userData = {
        id: 'temp-id', // This will be replaced when we fetch user data
        username: credentials.username,
        token: data.token
      };
      
      localStorage.setItem('taskify_token', data.token);
      localStorage.setItem('taskify_user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('Account created successfully!');
      navigate('/tasks');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      localStorage.removeItem('taskify_token');
      localStorage.removeItem('taskify_user');
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};