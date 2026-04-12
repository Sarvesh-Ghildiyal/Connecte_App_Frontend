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
  event: string; // Typically 'FINISH', 'CANCEL', 'ERROR'
  type: string;  // e.g., 'WA_EMBEDDED_SIGNUP'
  code?: string | null;
  data?: any;    // Contains the nested IDs (waba_id, phone_number_id, etc.)
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
    // We send the object exactly as structured (nested 'data' and top-level 'type')
    // to match the backend Pydantic model: MetaSetupRequest
    const response = await api.post<MetaSetupResponse>('/meta/setup', data);
    return response.data;
  },
};
