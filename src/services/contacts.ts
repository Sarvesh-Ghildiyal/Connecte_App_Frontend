import { api } from './api';
import type { Contact, ContactsResponse, BulkUploadRequest, BulkUploadResponse } from '@/types';

export const contactService = {
  getAll: async (params?: { tag?: string; limit?: number; offset?: number }) => {
    const response = await api.get<ContactsResponse>('/contacts', { params });
    return response.data;
  },

  bulkUpload: async (data: BulkUploadRequest) => {
    const response = await api.post<BulkUploadResponse>('/contacts/bulk', data);
    return response.data;
  },

  create: async (contact: Omit<Contact, 'id' | 'created_at'>) => {
    const response = await api.post<Contact>('/contacts', contact);
    return response.data;
  },

  update: async (id: string, data: Partial<Contact>) => {
    const response = await api.put<Contact>(`/contacts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/contacts/${id}`);
    return response.data;
  },
};
