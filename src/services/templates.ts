import { api } from './api';
import { useAuthStore } from '@/store/authStore';
import type { Template, CreateTemplateRequest } from '@/types';

const getClientUserId = (): string => {
  const user = useAuthStore.getState().user;
  if (!user?.id) throw new Error('No active user session. Please log in again.');
  return user.id;
};

export const templateService = {
  getAll: async () => {
    const client_user_id = getClientUserId();
    const response = await api.get<{ templates: Template[]; count: number }>('/templates/all', {
      params: { client_user_id },
    });
    return response.data.templates;
  },

  sync: async () => {
    const client_user_id = getClientUserId();
    const response = await api.post<{ templates: Template[]; count: number; message: string }>(
      '/templates/sync',
      {},
      { params: { client_user_id } }
    );
    return response.data;
  },

  getById: async (id: string) => {
    const client_user_id = getClientUserId();
    const response = await api.get<Template>(`/templates/${id}`, {
      params: { client_user_id },
    });
    return response.data;
  },

  create: async (data: CreateTemplateRequest) => {
    const client_user_id = getClientUserId();
    const response = await api.post<Template>('/templates', data, {
      params: { client_user_id },
    });
    return response.data;
  },

  delete: async (id: string) => {
    const client_user_id = getClientUserId();
    const response = await api.delete<{ success: boolean }>(`/templates/${id}`, {
      params: { client_user_id },
    });
    return response.data;
  },
};
