import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest.url?.includes('/auth/token') || originalRequest.url?.includes('/auth/me');

    if (!isAuthRoute && error.response) {
      const status = error.response.status;
      const detail = error.response.data?.detail;

      if (status === 401 || (status === 400 && detail === 'Cuenta de usuario desactivada')) {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);