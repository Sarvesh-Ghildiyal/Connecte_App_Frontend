import { api } from './api';
import { useAuthStore } from '@/store/authStore';
import type { Contact, ContactCreate } from '@/types';

/**
 * Returns the logged-in user's ID as the client_user_id query param.
 * Throws a clear error early if not logged in, so callers don't get a
 * cryptic 422 from the backend.
 */
function getClientUserId(): string {
  const user = useAuthStore.getState().user;
  if (!user?.id) {
    throw new Error('Not authenticated. Please log in again.');
  }
  return user.id;
}

export const contactService = {
  getAll: async (params?: { tag?: string; include_deleted?: boolean }) => {
    const client_user_id = getClientUserId();
    const response = await api.get<{ contacts: Contact[]; count: number }>('/contacts/all', {
      params: { client_user_id, ...params },
    });
    return response.data;
  },

  createOrUpdate: async (contacts_data: ContactCreate | ContactCreate[]) => {
    const client_user_id = getClientUserId();
    // Backend always expects an array
    const payload = Array.isArray(contacts_data) ? contacts_data : [contacts_data];
    const response = await api.post<{ message: string; added: number; updated: number }>(
      '/contacts/create',
      payload,
      { params: { client_user_id } }
    );
    return response.data;
  },

  archive: async (id: string) => {
    const client_user_id = getClientUserId();
    const response = await api.patch<{ status: string; message: string }>(
      `/contacts/${id}/archive`,
      {},
      { params: { client_user_id } }
    );
    return response.data;
  },

  restore: async (id: string) => {
    const client_user_id = getClientUserId();
    const response = await api.patch<{ status: string; message: string }>(
      `/contacts/${id}/restore`,
      {},
      { params: { client_user_id } }
    );
    return response.data;
  },
};
