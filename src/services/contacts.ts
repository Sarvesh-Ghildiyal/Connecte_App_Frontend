import { api } from './api';
import type { Contact, ContactCreate } from '@/types';

/**
 * Contact service — all identity is resolved server-side from the JWT bearer token.
 * No client_user_id query params needed; the backend derives user identity from the token.
 */
export const contactService = {
  getAll: async (params?: { tag?: string; include_deleted?: boolean }) => {
    const response = await api.get<{ contacts: Contact[]; count: number }>('/contacts/all', {
      params,
    });
    return response.data;
  },

  createOrUpdate: async (contacts_data: ContactCreate | ContactCreate[]) => {
    // Backend always expects an array
    const payload = Array.isArray(contacts_data) ? contacts_data : [contacts_data];
    const response = await api.post<{ message: string; added: number; updated: number }>(
      '/contacts/create',
      payload,
    );
    return response.data;
  },

  archive: async (id: string) => {
    const response = await api.patch<{ status: string; message: string }>(
      `/contacts/${id}/archive`,
      {},
    );
    return response.data;
  },

  restore: async (id: string) => {
    const response = await api.patch<{ status: string; message: string }>(
      `/contacts/${id}/restore`,
      {},
    );
    return response.data;
  },
};
