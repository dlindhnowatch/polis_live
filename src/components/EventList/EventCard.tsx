'use client';

import { PoliceEvent } from '@/types/police';
import { getEventTypeInfo, formatDateTime } from '@/utils/eventHelpers';
import { MapPin, Clock } from 'lucide-react';

interface EventCardProps {
  event: PoliceEvent;
  isSelected?: boolean;
  onClick?: (event: PoliceEvent) => void;
}

export default function EventCard({ event, isSelected, onClick }: EventCardProps) {
  const eventInfo = getEventTypeInfo(event.type);

  return (
    <div
      className={`
        p-4 bg-white rounded-lg shadow-sm border cursor-pointer transition-all duration-200
        hover:shadow-md hover:border-blue-300
        ${isSelected 
          ? 'border-blue-500 shadow-md ring-2 ring-blue-200' 
          : 'border-gray-200'
        }
      `}
      onClick={() => onClick?.(event)}
    >
      <div className="flex items-start gap-3">
        {/* Event Type Indicator */}
        <div className="flex-shrink-0">
          <div 
            className="w-3 h-3 rounded-full mt-1"
            style={{ backgroundColor: eventInfo.color }}
          />
        </div>
        
        {/* Event Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {event.type}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0">
              #{event.id}
            </span>
          </div>
          
          <p className="text-sm text-gray-800 mb-3 leading-relaxed">
            {event.summary}
          </p>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{event.location.name}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{formatDateTime(event.datetime)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}