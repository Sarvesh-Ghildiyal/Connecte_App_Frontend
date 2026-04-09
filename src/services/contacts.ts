import { api } from './api';
import type { Contact, ContactCreate } from '@/types';

export const contactService = {
  getAll: async (params?: { tag?: string }) => {
    const response = await api.get<{ contacts: Contact[]; count: number }>('/contacts/all', { params });
    return response.data;
  },

  createOrUpdate: async (contacts_data: ContactCreate | ContactCreate[]) => {
    const response = await api.post<{ message: string; added: number; updated: number }>(
      '/contacts/create',
      contacts_data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};
