import { create } from 'zustand';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('authToken'),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      console.log(data);
      const { token, user } = data.data;
      
      // Check role authorization
      if (!['admin', 'super-admin'].includes(user.role)) {
        toast.error('Access denied. Admin role required.');
        set({ isLoading: false });
        return false;
      }

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Login successful');
      return true;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    toast.success('Logged out successfully');
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));
