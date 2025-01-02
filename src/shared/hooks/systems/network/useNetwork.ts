// src/shared/hooks/systems/network/useNetwork.ts
import { networkService } from '@shared/lib/network/network.service'
import { useEffect, useState } from 'react'

export const useNetwork = () => {
  const [isOnline, setIsOnline] = useState(networkService.getConnectionStatus());
  
  useEffect(() => {
    const unsubscribe = networkService.addListener((status) => {
      setIsOnline(status);
    });

    return () => unsubscribe();
  }, []);

  return {
    isOnline,
    getConnectionInfo: networkService.getConnectionInfo,
  };
};
