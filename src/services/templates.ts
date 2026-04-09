import { api } from './api';
import type { Template, CreateTemplateRequest } from '@/types';

export const templateService = {
  getAll: async () => {
    const response = await api.get<{ templates: Template[]; count: number }>('/templates/all');
    return response.data.templates;
  },

  sync: async () => {
    const response = await api.post<{ templates: Template[]; count: number; message: string }>('/templates/sync');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Template>(`/templates/${id}`);
    return response.data;
  },

  create: async (data: CreateTemplateRequest) => {
    const response = await api.post<Template>('/templates', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/templates/${id}`);
    return response.data;
  },
};
