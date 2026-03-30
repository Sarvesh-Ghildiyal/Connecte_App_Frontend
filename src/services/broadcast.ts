import { api } from './api';

export interface BroadcastRequest {
  template_id: string;
  contact_ids: string[];
  variables?: Record<string, string>;
}

export interface BroadcastResponse {
  broadcast_id: string;
  status: 'queued';
  total_recipients: number;
  message: string;
}

export const broadcastService = {
  send: async (data: BroadcastRequest) => {
    const response = await api.post<BroadcastResponse>('/broadcast', data);
    return response.data;
  },
};
