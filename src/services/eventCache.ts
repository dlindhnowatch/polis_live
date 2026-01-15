import { PoliceEvent } from '@/types/police';

export interface CachedEvent extends PoliceEvent {
  cachedAt: string; // ISO timestamp when event was cached
  isArchived: boolean; // Whether event is no longer in current API response
}

export interface DateRange {
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
}

const CACHE_KEY = 'police_events_cache';
const CACHE_METADATA_KEY = 'police_events_cache_metadata';

interface CacheMetadata {
  lastFetch: string;
  totalEvents: number;
  oldestEvent: string;
  newestEvent: string;
}

class EventCacheService {
  private cache: Map<number, CachedEvent> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const events: CachedEvent[] = JSON.parse(cachedData);
        events.forEach(event => {
          this.cache.set(event.id, event);
        });
        console.log(`Loaded ${events.length} cached events from localStorage`);
      }
    } catch (error) {
      console.error('Error loading cached events:', error);
    }
    
    this.isInitialized = true;
  }

  async cacheEvents(newEvents: PoliceEvent[]): Promise<void> {
    await this.initialize();
    
    const now = new Date().toISOString();
    const currentEventIds = new Set(newEvents.map(e => e.id));
    
    // Mark existing events as archived if they're no longer in current API response
    for (const [id, cachedEvent] of this.cache.entries()) {
      if (!currentEventIds.has(id) && !cachedEvent.isArchived) {
        this.cache.set(id, { ...cachedEvent, isArchived: true });
      }
    }
    
    // Add new events to cache
    newEvents.forEach(event => {
      const existing = this.cache.get(event.id);
      this.cache.set(event.id, {
        ...event,
        cachedAt: existing?.cachedAt || now,
        isArchived: false
      });
    });
    
    await this.persistCache();
    this.updateMetadata();
  }

  async getEvents(dateRange?: DateRange): Promise<CachedEvent[]> {
    await this.initialize();
    
    let events = Array.from(this.cache.values());
    
    if (dateRange) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate + 'T23:59:59.999Z'); // Include full end date
      
      events = events.filter(event => {
        const eventDate = new Date(event.datetime);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }
    
    return events.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }

  async getCurrentEvents(): Promise<PoliceEvent[]> {
    await this.initialize();
    return Array.from(this.cache.values())
      .filter(event => !event.isArchived)
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }

  async getArchivedEvents(dateRange?: DateRange): Promise<CachedEvent[]> {
    await this.initialize();
    
    let events = Array.from(this.cache.values()).filter(event => event.isArchived);
    
    if (dateRange) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate + 'T23:59:59.999Z');
      
      events = events.filter(event => {
        const eventDate = new Date(event.datetime);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }
    
    return events.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }

  async getEventById(id: number): Promise<CachedEvent | null> {
    await this.initialize();
    return this.cache.get(id) || null;
  }

  async getCacheMetadata(): Promise<CacheMetadata | null> {
    try {
      const metadata = localStorage.getItem(CACHE_METADATA_KEY);
      return metadata ? JSON.parse(metadata) : null;
    } catch (error) {
      console.error('Error loading cache metadata:', error);
      return null;
    }
  }

  async getDateRange(): Promise<{ earliest: string; latest: string } | null> {
    await this.initialize();
    
    if (this.cache.size === 0) return null;
    
    const events = Array.from(this.cache.values());
    const dates = events.map(e => new Date(e.datetime)).sort();
    
    return {
      earliest: dates[0].toISOString().split('T')[0],
      latest: dates[dates.length - 1].toISOString().split('T')[0]
    };
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_METADATA_KEY);
    console.log('Cache cleared');
  }

  private async persistCache(): Promise<void> {
    try {
      const events = Array.from(this.cache.values());
      localStorage.setItem(CACHE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Error persisting cache:', error);
      // If localStorage is full, try to clear old archived events
      this.cleanupOldArchivedEvents();
    }
  }

  private updateMetadata(): void {
    const events = Array.from(this.cache.values());
    if (events.length === 0) return;
    
    const dates = events.map(e => new Date(e.datetime)).sort();
    const metadata: CacheMetadata = {
      lastFetch: new Date().toISOString(),
      totalEvents: events.length,
      oldestEvent: dates[0].toISOString(),
      newestEvent: dates[dates.length - 1].toISOString()
    };
    
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
  }

  private cleanupOldArchivedEvents(): void {
    const events = Array.from(this.cache.values());
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep last 30 days
    
    const eventsToKeep = events.filter(event => {
      const eventDate = new Date(event.datetime);
      return !event.isArchived || eventDate >= cutoffDate;
    });
    
    this.cache.clear();
    eventsToKeep.forEach(event => {
      this.cache.set(event.id, event);
    });
    
    this.persistCache();
    console.log(`Cleaned up cache, kept ${eventsToKeep.length} events`);
  }
}

export const eventCacheService = new EventCacheService();