import { PoliceEvent } from '@/types/police';
import { eventCacheService, CachedEvent } from './eventCache';

interface SharedCacheResponse {
  events: CachedEvent[];
  metadata: {
    lastUpdate: string;
    totalEvents: number;
    contributors: string[];
    oldestEvent?: string;
    newestEvent?: string;
  };
}

interface UploadResponse {
  success: boolean;
  newEvents: number;
  updatedEvents: number;
  totalEvents: number;
  contributors: number;
}

class SharedCacheService {
  private lastSyncTime: string | null = null;
  private syncInProgress = false;
  private uploadInProgress = false;
  
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly UPLOAD_INTERVAL = 10 * 60 * 1000; // 10 minutes
  private readonly COORDINATION_KEY = 'shared_cache_coordination';

  async initialize(): Promise<void> {
    // Load last sync time from localStorage
    this.lastSyncTime = localStorage.getItem('last_shared_sync') || null;
    
    // Start background sync process
    this.startBackgroundSync();
  }

  private startBackgroundSync(): void {
    // Initial sync
    setTimeout(() => this.performSync(), 2000); // Wait 2s after page load
    
    // Regular sync interval
    setInterval(() => this.performSync(), this.SYNC_INTERVAL);
    
    // Regular upload interval
    setInterval(() => this.uploadLocalCache(), this.UPLOAD_INTERVAL);
  }

  private async performSync(): Promise<void> {
    if (this.syncInProgress) return;
    
    try {
      this.syncInProgress = true;
      
      // Check if someone else is syncing recently (coordination)
      const coordination = this.getCoordination();
      const now = Date.now();
      
      // If someone synced in last 2 minutes, skip this sync
      if (coordination.lastSync && (now - coordination.lastSync) < 2 * 60 * 1000) {
        return;
      }
      
      // Update coordination to indicate we're syncing
      this.updateCoordination({ lastSync: now });
      
      // Fetch shared cache data
      const since = this.lastSyncTime ? `?since=${encodeURIComponent(this.lastSyncTime)}` : '';
      const response = await fetch(`/api/shared-cache${since}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: SharedCacheResponse = await response.json();
      
      if (data.events.length > 0) {
        // Merge shared events into local cache
        await this.mergeSharedEvents(data.events);
        console.log(`Synced ${data.events.length} events from shared cache`);
      }
      
      // Update last sync time
      this.lastSyncTime = new Date().toISOString();
      localStorage.setItem('last_shared_sync', this.lastSyncTime);
      
    } catch (error) {
      console.error('Error syncing with shared cache:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async uploadLocalCache(): Promise<void> {
    if (this.uploadInProgress) return;
    
    try {
      this.uploadInProgress = true;
      
      // Get local cached events
      const localEvents = await eventCacheService.getEvents();
      
      if (localEvents.length === 0) return;
      
      // Upload to shared cache
      const response = await fetch('/api/shared-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: localEvents }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result: UploadResponse = await response.json();
      
      if (result.newEvents > 0 || result.updatedEvents > 0) {
        console.log(`Uploaded to shared cache: ${result.newEvents} new, ${result.updatedEvents} updated events`);
      }
      
    } catch (error) {
      console.error('Error uploading to shared cache:', error);
    } finally {
      this.uploadInProgress = false;
    }
  }

  private async mergeSharedEvents(sharedEvents: CachedEvent[]): Promise<void> {
    // Get current local events
    const localEvents = await eventCacheService.getEvents();
    const localEventIds = new Set(localEvents.map(e => e.id));
    
    // Filter out events we already have (unless shared version is newer)
    const eventsToMerge = sharedEvents.filter(sharedEvent => {
      if (!localEventIds.has(sharedEvent.id)) {
        return true; // New event
      }
      
      const localEvent = localEvents.find(e => e.id === sharedEvent.id);
      if (!localEvent) return true;
      
      // Check if shared version is newer or has archive status we don't have
      const sharedCacheTime = new Date(sharedEvent.cachedAt).getTime();
      const localCacheTime = new Date(localEvent.cachedAt).getTime();
      
      return sharedCacheTime > localCacheTime || (!localEvent.isArchived && sharedEvent.isArchived);
    });
    
    if (eventsToMerge.length > 0) {
      // Convert shared events to regular PoliceEvents and cache them
      const eventsToCache: PoliceEvent[] = eventsToMerge.map(event => ({
        id: event.id,
        datetime: event.datetime,
        name: event.name,
        summary: event.summary,
        url: event.url,
        type: event.type,
        location: event.location,
      }));
      
      await eventCacheService.cacheEvents(eventsToCache);
      
      // Update archived status if needed
      for (const sharedEvent of eventsToMerge) {
        if (sharedEvent.isArchived) {
          // We'd need to add a method to update archive status
          // For now, this will be handled by the regular cache logic
        }
      }
    }
  }

  private getCoordination(): { lastSync?: number } {
    try {
      const stored = localStorage.getItem(this.COORDINATION_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private updateCoordination(update: { lastSync?: number }): void {
    try {
      const current = this.getCoordination();
      const updated = { ...current, ...update };
      localStorage.setItem(this.COORDINATION_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating coordination:', error);
    }
  }

  async getSharedCacheStats(): Promise<SharedCacheResponse['metadata'] | null> {
    try {
      const response = await fetch('/api/shared-cache');
      if (!response.ok) return null;
      
      const data: SharedCacheResponse = await response.json();
      return data.metadata;
    } catch (error) {
      console.error('Error fetching shared cache stats:', error);
      return null;
    }
  }

  async forceSync(): Promise<void> {
    this.lastSyncTime = null; // Force full sync
    await this.performSync();
  }

  async forceUpload(): Promise<void> {
    await this.uploadLocalCache();
  }
}

export const sharedCacheService = new SharedCacheService();