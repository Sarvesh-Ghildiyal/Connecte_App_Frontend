import { api } from './api';
import type { BroadcastRequest, BroadcastResponse } from '@/types';

/**
 * Broadcast service — identity is resolved server-side from the JWT + X-Waba-Id header.
 * The X-Waba-Id header is automatically attached by the api.ts request interceptor.
 */
export const broadcastService = {
  send: async (data: BroadcastRequest) => {
    const response = await api.post<BroadcastResponse>('/broadcast/send', data);
    return response.data;
  },

  getStats: async (params?: { mode?: 'all' | 'last' }) => {
    const response = await api.get<{
      total_sent: number;
      accepted: number;
      sent: number;
      delivered: number;
      read: number;
      failed: number;
      delivery_rate: number;
      read_rate: number;
    }>('/broadcast/stats', { params });
    return response.data;
  },
};
