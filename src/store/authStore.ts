import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
}

interface MetaData {
  waba_id: string | null;
  phone_number_id: string | null;
  connected_at?: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isMetaConnected: boolean;
  metaData: MetaData;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setMetaConnection: (data: MetaData) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isMetaConnected: false,
      metaData: {
        waba_id: null,
        phone_number_id: null,
      },

      // Actions
      login: (token, user) => {
        sessionStorage.setItem('connecte_auth_token', token);
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        sessionStorage.removeItem('connecte_auth_token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isMetaConnected: false,
          metaData: { waba_id: null, phone_number_id: null },
        });
      },

      setMetaConnection: (data) => {
        set({
          isMetaConnected: true,
          metaData: data,
        });
      },

      checkAuth: () => {
        const token = sessionStorage.getItem('connecte_auth_token');
        if (token) {
          set({ token, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist token (use sessionStorage)
        user: state.user,
        isMetaConnected: state.isMetaConnected,
        metaData: state.metaData,
      }),
    }
  )
);
