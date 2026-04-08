import { api } from './api';
import type { Contact } from '@/types';

export const contactService = {
  getAll: async (params?: { tag?: string }) => {
    const response = await api.get<{ contacts: Contact[]; count: number }>('/contacts/all', { params });
    return response.data;
  },

  importContacts: async (contacts: any[]) => {
    const response = await api.post<{ added: number; updated: number }>('/contacts/import', contacts);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};
