import { api } from './api';
import { useAuthStore } from '@/store/authStore';
import type { BroadcastRequest, BroadcastResponse } from '@/types';

const getClientUserId = (): string => {
  const user = useAuthStore.getState().user;
  if (!user?.id) throw new Error('No active user session. Please log in again.');
  return user.id;
};

export const broadcastService = {
  send: async (data: BroadcastRequest) => {
    const client_user_id = getClientUserId();
    const response = await api.post<BroadcastResponse>('/broadcast/send', data, {
      params: { client_user_id },
    });
    return response.data;
  },
};
