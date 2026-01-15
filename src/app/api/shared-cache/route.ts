import { NextRequest, NextResponse } from 'next/server';
import { PoliceEvent } from '@/types/police';

interface SharedCacheEvent extends PoliceEvent {
  cachedAt: string;
  isArchived: boolean;
  contributorId: string;
}

interface SharedCacheData {
  events: Map<number, SharedCacheEvent>;
  metadata: {
    lastUpdate: string;
    totalEvents: number;
    contributors: Set<string>;
    oldestEvent?: string;
    newestEvent?: string;
  };
}

// In-memory shared cache (resets on deployment, but that's OK for free tier)
let sharedCache: SharedCacheData = {
  events: new Map(),
  metadata: {
    lastUpdate: new Date().toISOString(),
    totalEvents: 0,
    contributors: new Set(),
  }
};

// Helper to generate anonymous contributor ID
function generateContributorId(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'anonymous';
  // Create a simple hash to anonymize IP
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `contrib_${Math.abs(hash)}`;
}

// GET: Retrieve shared cache data
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const since = url.searchParams.get('since');
  
  try {
    let events = Array.from(sharedCache.events.values());
    
    // Filter events since a specific date if provided
    if (since) {
      const sinceDate = new Date(since);
      events = events.filter(event => new Date(event.cachedAt) > sinceDate);
    }
    
    // Sort by datetime (newest first)
    events.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
    
    const response = {
      events,
      metadata: {
        ...sharedCache.metadata,
        contributors: Array.from(sharedCache.metadata.contributors),
        totalEvents: sharedCache.events.size,
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error retrieving shared cache:', error);
    return NextResponse.json({ error: 'Failed to retrieve cache' }, { status: 500 });
  }
}

// POST: Upload events to shared cache
export async function POST(req: NextRequest) {
  try {
    const { events }: { events: Omit<SharedCacheEvent, 'contributorId'>[] } = await req.json();
    const contributorId = generateContributorId(req);
    
    let newEventsCount = 0;
    let updatedEventsCount = 0;
    
    events.forEach(event => {
      const eventWithContributor: SharedCacheEvent = {
        ...event,
        contributorId
      };
      
      const existing = sharedCache.events.get(event.id);
      if (!existing) {
        sharedCache.events.set(event.id, eventWithContributor);
        newEventsCount++;
      } else {
        // Update if this version is newer or has more recent cache timestamp
        const eventCacheTime = new Date(event.cachedAt).getTime();
        const existingCacheTime = new Date(existing.cachedAt).getTime();
        
        if (eventCacheTime > existingCacheTime || (!existing.isArchived && event.isArchived)) {
          sharedCache.events.set(event.id, eventWithContributor);
          updatedEventsCount++;
        }
      }
    });
    
    // Update metadata
    sharedCache.metadata.contributors.add(contributorId);
    sharedCache.metadata.lastUpdate = new Date().toISOString();
    sharedCache.metadata.totalEvents = sharedCache.events.size;
    
    // Update date range
    const allEvents = Array.from(sharedCache.events.values());
    if (allEvents.length > 0) {
      const dates = allEvents.map(e => new Date(e.datetime)).sort();
      sharedCache.metadata.oldestEvent = dates[0].toISOString();
      sharedCache.metadata.newestEvent = dates[dates.length - 1].toISOString();
    }
    
    return NextResponse.json({
      success: true,
      newEvents: newEventsCount,
      updatedEvents: updatedEventsCount,
      totalEvents: sharedCache.metadata.totalEvents,
      contributors: sharedCache.metadata.contributors.size
    });
  } catch (error) {
    console.error('Error updating shared cache:', error);
    return NextResponse.json({ error: 'Failed to update cache' }, { status: 500 });
  }
}

// DELETE: Clear shared cache (for maintenance)
export async function DELETE() {
  try {
    sharedCache = {
      events: new Map(),
      metadata: {
        lastUpdate: new Date().toISOString(),
        totalEvents: 0,
        contributors: new Set(),
      }
    };
    
    return NextResponse.json({ success: true, message: 'Shared cache cleared' });
  } catch (error) {
    console.error('Error clearing shared cache:', error);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}