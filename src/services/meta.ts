import { api } from './api';

// ── TYPES: Meta Connection Status ───────────────────────────────────────────

export interface MetaStatusResponse {
  is_connected: boolean;
  waba_id: string | null;
  phone_number_id: string | null;
  connected_at: string | null;
}

// ── LOGIC: Meta Connection Status ───────────────────────────────────────────

export const metaService = {
  getStatus: async () => {
    const response = await api.get<MetaStatusResponse>('/meta/status');
    return response.data;
  },
};
