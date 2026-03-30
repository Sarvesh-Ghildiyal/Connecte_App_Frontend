import { api } from './api';

export interface MetaCallbackRequest {
  code: string;
  waba_id: string;
  phone_number_id: string;
  business_id: string;
}

export interface MetaCallbackResponse {
  success: boolean;
  message: string;
  waba_id: string;
  phone_number_id: string;
}

export interface MetaStatusResponse {
  is_connected: boolean;
  waba_id: string | null;
  phone_number_id: string | null;
  connected_at: string | null;
}

export const metaService = {
  sendCallback: async (data: MetaCallbackRequest) => {
    const response = await api.post<MetaCallbackResponse>('/meta/callback', data);
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get<MetaStatusResponse>('/meta/status');
    return response.data;
  },
};
