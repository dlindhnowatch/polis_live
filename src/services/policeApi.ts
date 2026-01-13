import { PoliceEvent, EventFilters } from '@/types/police';

const BASE_URL = 'https://polisen.se/api/events';

export async function fetchPoliceEvents(filters?: EventFilters): Promise<PoliceEvent[]> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.dateTime) {
      params.append('DateTime', filters.dateTime);
    }
    
    if (filters?.locationName) {
      params.append('locationname', filters.locationName);
    }
    
    if (filters?.eventType) {
      params.append('type', filters.eventType);
    }

    const url = `${BASE_URL}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const events: PoliceEvent[] = await response.json();
    
    // Filter by search query if provided (client-side filtering)
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return events.filter(event => 
        event.name.toLowerCase().includes(query) ||
        event.summary.toLowerCase().includes(query) ||
        event.location.name.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query)
      );
    }

    return events;
  } catch (error) {
    console.error('Error fetching police events:', error);
    throw new Error('Failed to fetch police events. Please try again later.');
  }
}