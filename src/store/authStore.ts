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
  activeWabaId: string | null;

  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setMetaConnection: (data: MetaData) => void;
  setActiveWabaId: (id: string | null) => void;
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
      activeWabaId: null,

      // Actions
      login: (token, user) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isMetaConnected: false,
          metaData: { waba_id: null, phone_number_id: null },
          activeWabaId: null,
        });
      },

      setMetaConnection: (data) => {
        set({
          isMetaConnected: true,
          metaData: data,
          activeWabaId: data.waba_id,
        });
      },

      setActiveWabaId: (id) => {
        set({ activeWabaId: id });
      },

      checkAuth: () => {
        // Auth is now managed strictly via browser HttpOnly cookies and Zustand rehydration
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Persist auth status, active waba and user details
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isMetaConnected: state.isMetaConnected,
        metaData: state.metaData,
        activeWabaId: state.activeWabaId,
      }),
    }
  )
);
