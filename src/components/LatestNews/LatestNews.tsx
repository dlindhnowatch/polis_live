'use client';

import { PoliceEvent } from '@/types/police';
import { getEventTypeInfo, formatDateTime } from '@/utils/eventHelpers';
import { Clock, MapPin, TrendingUp, AlertCircle } from 'lucide-react';

interface LatestNewsProps {
  events: PoliceEvent[];
  onEventSelect?: (event: PoliceEvent) => void;
}

export default function LatestNews({ events, onEventSelect }: LatestNewsProps) {
  // Get the 5 most recent events
  const latestEvents = events
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
    .slice(0, 5);

  const getTimeAgo = (datetime: string) => {
    const now = new Date();
    const eventTime = new Date(datetime);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min sedan`;
    } else if (diffHours < 24) {
      return `${diffHours} timmar sedan`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} dagar sedan`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-blue-200" />
          <h2 className="text-xl font-bold text-white">Senaste nytt</h2>
          <div className="flex items-center gap-1 text-blue-200 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Live</span>
          </div>
        </div>
        <p className="text-blue-100 text-sm mt-1">
          De senaste polishändelserna i realtid
        </p>
      </div>

      {/* News List */}
      <div className="divide-y divide-gray-100">
        {latestEvents.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Inga händelser hittade</p>
          </div>
        ) : (
          latestEvents.map((event, index) => {
            const eventInfo = getEventTypeInfo(event.type);
            const isBreaking = index === 0;
            
            return (
              <article
                key={event.id}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  isBreaking ? 'bg-red-50 border-l-4 border-red-500' : ''
                }`}
                onClick={() => onEventSelect?.(event)}
              >
                {/* Breaking news badge */}
                {isBreaking && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                      Breaking
                    </div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}

                {/* Event content */}
                <div className="flex gap-4">
                  {/* Event type indicator */}
                  <div className="flex-shrink-0">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: eventInfo.color }}
                    >
                      {event.type.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {event.type}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(event.datetime)}</span>
                      </div>
                    </div>

                    <p className="text-gray-800 text-sm mb-3 leading-relaxed">
                      {event.summary}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{event.location.name}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventSelect?.(event);
                        }}
                        className="text-blue-700 hover:text-blue-900 font-medium text-sm transition-colors"
                      >
                        Läs mer →
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-600 text-center">
          Uppdateras automatiskt var 10:e minut • Data från polisen.se
        </p>
      </div>
    </div>
  );
}