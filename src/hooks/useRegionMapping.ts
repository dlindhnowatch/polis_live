import { useState, useEffect, useMemo } from 'react';
import { PoliceEvent } from '@/types/police';
import { getRegionForLocation, getAllRegionsWithData } from '@/utils/regionMapping';

interface RegionMappingResult {
  regionEvents: PoliceEvent[];
  availableRegions: string[];
  isLoading: boolean;
  mappingStats: {
    totalEvents: number;
    mappedEvents: number;
    unmappedEvents: number;
  };
}

export function useRegionMapping(
  allEvents: PoliceEvent[],
  selectedRegion: string
): RegionMappingResult {
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventRegionMap, setEventRegionMap] = useState<Map<number, string | null>>(new Map());

  // Load available regions
  useEffect(() => {
    let isMounted = true;
    
    async function loadRegions() {
      try {
        const regions = await getAllRegionsWithData();
        if (isMounted) {
          setAvailableRegions(regions);
        }
      } catch (error) {
        console.error('Error loading available regions:', error);
        if (isMounted) {
          setAvailableRegions(['Stockholm', 'Skåne', 'Västra Götaland']); // fallback
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRegions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Map events to regions
  useEffect(() => {
    let isMounted = true;
    
    async function mapEventsToRegions() {
      if (allEvents.length === 0) return;

      console.log(`Starting to map ${allEvents.length} events to regions...`);
      const newMap = new Map<number, string | null>();
      let mappedCount = 0;
      
      // Process events in batches to avoid blocking the UI
      const batchSize = 50;
      for (let i = 0; i < allEvents.length; i += batchSize) {
        const batch = allEvents.slice(i, i + batchSize);
        
        for (const event of batch) {
          try {
            const region = await getRegionForLocation(event.location.name);
            newMap.set(event.id, region);
            if (region) {
              mappedCount++;
            }
            
            // Log some examples for debugging
            if (i < 10 || (region && mappedCount < 5)) {
              console.log(`Event ${event.id}: "${event.location.name}" -> ${region || 'UNMAPPED'}`);
            }
          } catch (error) {
            console.error('Error mapping event to region:', event.id, error);
            newMap.set(event.id, null);
          }
        }

        if (!isMounted) return;
        
        // Yield control to prevent blocking
        if (i + batchSize < allEvents.length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      console.log(`Mapping complete: ${mappedCount}/${allEvents.length} events mapped`);

      if (isMounted) {
        setEventRegionMap(newMap);
      }
    }

    mapEventsToRegions();

    return () => {
      isMounted = false;
    };
  }, [allEvents]);

  // Filter events for selected region
  const regionEvents = useMemo(() => {
    return allEvents.filter(event => {
      const eventRegion = eventRegionMap.get(event.id);
      return eventRegion === selectedRegion;
    });
  }, [allEvents, selectedRegion, eventRegionMap]);

  // Calculate mapping statistics
  const mappingStats = useMemo(() => {
    const totalEvents = allEvents.length;
    const mappedEvents = Array.from(eventRegionMap.values()).filter(region => region !== null).length;
    const unmappedEvents = totalEvents - mappedEvents;

    return {
      totalEvents,
      mappedEvents,
      unmappedEvents,
    };
  }, [allEvents.length, eventRegionMap]);

  const finalIsLoading = isLoading || eventRegionMap.size === 0;

  return {
    regionEvents,
    availableRegions,
    isLoading: finalIsLoading,
    mappingStats,
  };
}