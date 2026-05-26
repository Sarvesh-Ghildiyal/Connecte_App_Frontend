import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const isProd = import.meta.env.PROD;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isProd ? '' : 'http://localhost:8000');

if (isProd && !import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not defined in production environment.');
}

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Attach active Waba ID & Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('connecte_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const { activeWabaId } = useAuthStore.getState();
    if (activeWabaId) {
      config.headers['X-Waba-Id'] = activeWabaId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - Handle 401 and Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest) {
      // Don't intercept auth-related endpoints to prevent loops
      const isLoginRequest = originalRequest.url?.includes('/auth/login');
      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

      if (isLoginRequest || isRefreshRequest) {
        // If refresh fails, we clear state and redirect
        if (isRefreshRequest) {
          useAuthStore.getState().logout();
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }

      // If we already retried this request once, it truly failed
      if (originalRequest._retry) {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      // If another request is currently refreshing the token, queue this one
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = 'Bearer ' + token;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Mark this request so we don't infinitely retry it
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the backend to refresh the token.
        // We use a fresh axios instance here to avoid interceptor loops,
        // and we MUST pass withCredentials: true so the browser sends the HttpOnly refresh_token cookie.
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true, 
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
        // Extract the new access token
        const newAccessToken = response.data.access_token;
        
        // Update session storage
        localStorage.setItem('connecte_auth_token', newAccessToken);
        
        // Update original request header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Process the queue for any other requests that were waiting
        processQueue(null, newAccessToken);
        
        // Retry the original request (cookies are now updated/refreshed)
        return api(originalRequest);
        
      } catch (refreshError) {
        // If the refresh token itself is invalid or expired
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);
