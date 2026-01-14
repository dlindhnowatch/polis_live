'use client';

import { useEffect, useState } from 'react';
import useNotificationStore from '@/store/notificationStore';

export function useHydratedNotificationStore() {
  const [isHydrated, setIsHydrated] = useState(false);
  const store = useNotificationStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    ...store,
    isHydrated,
  };
}