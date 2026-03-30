import { api } from './api';
import type { Template, CreateTemplateRequest } from '@/types';

export const templateService = {
  getAll: async () => {
    const response = await api.get<{ templates: Template[] }>('/templates');
    return response.data.templates;
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
