'use client';

import { PoliceEvent } from '@/types/police';
import EventCard from './EventCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EventListProps {
  events: PoliceEvent[];
  selectedEventId?: number | null;
  onEventSelect?: (event: PoliceEvent) => void;
  isLoading?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
}

export default function EventList({ 
  events, 
  selectedEventId, 
  onEventSelect, 
  isLoading,
  isCollapsed,
  onToggleCollapse,
  isMobile = false
}: EventListProps) {
  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Visa händelselista"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
        <div className="mt-4 -rotate-90 text-xs text-gray-500 whitespace-nowrap">
          {events.length} händelser
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-gray-50 flex flex-col ${isMobile ? '' : 'border-r border-gray-200'}`}>
      {/* Header */}
      <div className="flex-none p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Polishändelser</h2>
            <p className="text-sm text-gray-700">
              {events.length} händelser funna
            </p>
          </div>
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              title="Dölj händelselista"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Event List - with proper mobile scrolling */}
      <div 
        className={`flex-1 overflow-y-auto ${isMobile ? 'overscroll-contain' : ''}`}
        style={{ 
          WebkitOverflowScrolling: 'touch',
          touchAction: isMobile ? 'pan-y' : 'auto',
          ...(isMobile && { 
            minHeight: 0,
            height: '100%'
          })
        }}
      >
        <div className="p-4 space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-700">Inga händelser hittades</p>
              <p className="text-sm text-gray-600 mt-1">
                Prova att justera dina filter
              </p>
            </div>
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isSelected={event.id === selectedEventId}
                onClick={onEventSelect}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer with stats */}
      {events.length > 0 && (
        <div className="flex-none p-4 border-t border-gray-200 bg-white">
          <div className="flex justify-between text-xs text-gray-700">
            <span>Senaste uppdatering</span>
            <span>{new Date().toLocaleTimeString('sv-SE')}</span>
          </div>
        </div>
      )}
    </div>
  );
}