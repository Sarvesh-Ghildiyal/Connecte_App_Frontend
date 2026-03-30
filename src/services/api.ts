import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Attach JWT token from sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('connecte_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state
      sessionStorage.removeItem('connecte_auth_token');

      // Redirect to login
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
