import { api } from './api';
import type { BroadcastRequest, BroadcastResponse } from '@/types';

export const broadcastService = {
  send: async (data: BroadcastRequest) => {
    const response = await api.post<BroadcastResponse>('/broadcast/send', data);
    return response.data;
  },
};
