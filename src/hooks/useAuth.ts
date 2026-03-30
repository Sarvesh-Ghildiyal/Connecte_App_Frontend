import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { metaService } from '@/services/meta';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isMetaConnected,
    metaData,
    login,
    logout,
    setMetaConnection,
    checkAuth,
  } = useAuthStore();

  useEffect(() => {
    checkAuth();

    // Check Meta connection status on mount if authenticated
    if (isAuthenticated) {
      metaService
        .getStatus()
        .then((status) => {
          if (status.is_connected) {
            setMetaConnection({
              waba_id: status.waba_id,
              phone_number_id: status.phone_number_id,
              connected_at: status.connected_at ?? undefined,
            });
          }
        })
        .catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return {
    user,
    token,
    isAuthenticated,
    isMetaConnected,
    metaData,
    login,
    logout,
    setMetaConnection,
  };
};
