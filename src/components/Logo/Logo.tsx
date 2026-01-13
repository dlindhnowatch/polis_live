'use client';

import { Shield, Radar, Clock, MapPin } from 'lucide-react';
import { PoliceEvent } from '@/types/police';
import { getEventTypeInfo, formatDateTime } from '@/utils/eventHelpers';

interface LogoProps {
  events?: PoliceEvent[];
  onEventSelect?: (event: PoliceEvent) => void;
}

export default function Logo({ events = [], onEventSelect }: LogoProps) {
  // Get the 3 most recent events for the ticker
  const recentEvents = events
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
    .slice(0, 3);

  const getTimeAgo = (datetime: string) => {
    const now = new Date();
    const eventTime = new Date(datetime);
    const diffMins = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h`;
    } else {
      return `${Math.floor(diffMins / 1440)}d`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-blue-900/20 animate-pulse"></div>
      
      {/* Radar sweep animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="radar-sweep"></div>
      </div>
      
      {/* Mobile layout */}
      <div className="block md:hidden relative px-4 py-3 z-10">
        {/* Mobile logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-blue-300 animate-pulse" />
          <h1 className="text-xl font-bold text-white">
            Daniels polisradar
          </h1>
          <Radar className="w-6 h-6 text-blue-300 animate-ping" />
        </div>
        
        {/* Mobile ticker - simplified */}
        {recentEvents.length > 0 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">
                LIVE
              </div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-white text-sm">
              {recentEvents[0].type} i {recentEvents[0].location.name}
            </div>
          </div>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block relative px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          {/* Logo content */}
          <div className="flex items-center gap-4">
            {/* Animated shield icon */}
            <div className="relative">
              <Shield className="w-8 h-8 text-blue-300 animate-pulse" />
              <div className="absolute inset-0 w-8 h-8">
                <Radar className="w-8 h-8 text-blue-400 animate-spin-slow opacity-60" />
              </div>
            </div>
            
            {/* Main logo text */}
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white animate-gradient-shift tracking-wide">
              Daniels polisradar
            </h1>
            
            {/* Animated radar icon */}
            <div className="relative">
              <Radar className="w-8 h-8 text-blue-300 animate-ping" />
              <div className="absolute inset-0 w-8 h-8">
                <Shield className="w-8 h-8 text-blue-400 animate-pulse opacity-60" />
              </div>
            </div>
          </div>

          {/* News ticker */}
          <div className="flex-1 max-w-2xl mx-8 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">
                LIVE
              </div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="relative overflow-hidden h-8">
              <div className="flex animate-scroll">
                {recentEvents.map((event, index) => {
                  const eventInfo = getEventTypeInfo(event.type);
                  return (
                    <div
                      key={`${event.id}-${index}`}
                      className="flex items-center gap-3 mr-12 cursor-pointer hover:text-blue-200 transition-colors"
                      onClick={() => onEventSelect?.(event)}
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: eventInfo.color }}
                      />
                      <span className="text-white font-medium text-sm whitespace-nowrap">
                        {event.type} i {event.location.name}
                      </span>
                      <div className="flex items-center gap-1 text-blue-200 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(event.datetime)}</span>
                      </div>
                    </div>
                  );
                })}
                {/* Duplicate for seamless loop */}
                {recentEvents.map((event, index) => {
                  const eventInfo = getEventTypeInfo(event.type);
                  return (
                    <div
                      key={`${event.id}-duplicate-${index}`}
                      className="flex items-center gap-3 mr-12 cursor-pointer hover:text-blue-200 transition-colors"
                      onClick={() => onEventSelect?.(event)}
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: eventInfo.color }}
                      />
                      <span className="text-white font-medium text-sm whitespace-nowrap">
                        {event.type} i {event.location.name}
                      </span>
                      <div className="flex items-center gap-1 text-blue-200 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(event.datetime)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-blue-400/10 blur-xl animate-pulse"></div>
    </div>
  );
}