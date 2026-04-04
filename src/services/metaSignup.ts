import { api } from './api';

// ── TYPES: WhatsApp Embedded Signup ─────────────────────────────────────────

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

export interface MetaSetupRequest {
  status: 'success' | 'cancel' | 'error';
  code?: string;
  data?: any; // Contains the full message event data (phone_num_id, waba_id, etc.)
  error?: {
    message: string;
    code: string | number;
    session_id?: string;
    timestamp?: string;
  };
}

export interface MetaSetupResponse {
  success: boolean;
  message: string;
}

// ── LOGIC: WhatsApp Embedded Signup ─────────────────────────────────────────

export const metaSignupService = {
  sendCallback: async (data: MetaCallbackRequest) => {
    const response = await api.post<MetaCallbackResponse>('/meta/callback', data);
    return response.data;
  },

  setup: async (data: MetaSetupRequest) => {
    const response = await api.post<MetaSetupResponse>('/meta/setup', data);
    return response.data;
  },
};
