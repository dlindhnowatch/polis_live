import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPoliceEvents } from '@/services/policeApi';
import { PoliceEvent, EventFilters } from '@/types/police';
import { eventCacheService, DateRange, CachedEvent } from '@/services/eventCache';
import { sharedCacheService } from '@/services/sharedCache';
import { useEffect } from 'react';

export function usePoliceEvents(filters?: EventFilters) {
  const queryClient = useQueryClient();

  const query = useQuery<PoliceEvent[], Error>({
    queryKey: ['police-events', filters],
    queryFn: async () => {
      const events = await fetchPoliceEvents(filters);
      // Cache the events when fetched
      await eventCacheService.cacheEvents(events);
      return events;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return query;
}

// Hook for cached/historical events with date range support
export function useCachedEvents(dateRange?: DateRange, archiveMode: boolean = false) {
  return useQuery<CachedEvent[], Error>({
    queryKey: ['cached-events', dateRange, archiveMode],
    queryFn: async () => {
      if (archiveMode) {
        return await eventCacheService.getArchivedEvents(dateRange);
      } else if (dateRange) {
        return await eventCacheService.getEvents(dateRange);
      } else {
        return await eventCacheService.getCurrentEvents();
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for cached data
    retry: 1,
  });
}

// Hook for cache metadata
export function useCacheMetadata() {
  return useQuery({
    queryKey: ['cache-metadata'],
    queryFn: () => eventCacheService.getCacheMetadata(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook for available date range
export function useAvailableDateRange() {
  return useQuery({
    queryKey: ['available-date-range'],
    queryFn: () => eventCacheService.getDateRange(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for shared cache statistics
export function useSharedCacheStats() {
  return useQuery({
    queryKey: ['shared-cache-stats'],
    queryFn: () => sharedCacheService.getSharedCacheStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}