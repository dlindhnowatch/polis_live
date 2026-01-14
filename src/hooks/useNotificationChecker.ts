import { useEffect } from 'react';
import { PoliceEvent } from '@/types/police';
import useNotificationStore from '@/store/notificationStore';

export function useNotificationChecker(events: PoliceEvent[]) {
  const checkNewEvents = useNotificationStore((state) => state.checkNewEvents);

  useEffect(() => {
    if (events.length > 0) {
      checkNewEvents(events);
    }
  }, [events, checkNewEvents]);
}