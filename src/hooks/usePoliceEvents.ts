import { useQuery } from '@tanstack/react-query';
import { fetchPoliceEvents } from '@/services/policeApi';
import { PoliceEvent, EventFilters } from '@/types/police';

export function usePoliceEvents(filters?: EventFilters) {
  return useQuery<PoliceEvent[], Error>({
    queryKey: ['police-events', filters],
    queryFn: () => fetchPoliceEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}