'use client';

import dynamic from 'next/dynamic';
import { PoliceEvent } from '@/types/police';

// Dynamically import the map to avoid SSR issues
const DynamicEventMap = dynamic(() => import('./EventMapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Laddar karta...</p>
      </div>
    </div>
  )
});

interface EventMapProps {
  events: PoliceEvent[];
  selectedEventId?: number | null;
  onEventSelect?: (event: PoliceEvent) => void;
}

export default function EventMap({ events, selectedEventId, onEventSelect }: EventMapProps) {
  return (
    <DynamicEventMap 
      events={events} 
      selectedEventId={selectedEventId} 
      onEventSelect={onEventSelect}
    />
  );
}