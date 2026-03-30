import { api } from './api';

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export const authService = {
  signup: async (data: SignupRequest) => {
    const response = await api.post<{ message: string; user: UserResponse }>(
      '/auth/sign_up',
      data
    );
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};
