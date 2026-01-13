'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { PoliceEvent } from '@/types/police';
import { getEventTypeInfo, parseCoordinates, formatDateTime } from '@/utils/eventHelpers';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet-images/marker-icon-2x.png',
  iconUrl: '/leaflet-images/marker-icon.png',
  shadowUrl: '/leaflet-images/marker-shadow.png',
});

interface EventMapClientProps {
  events: PoliceEvent[];
  selectedEventId?: number | null;
  onEventSelect?: (event: PoliceEvent) => void;
}

// Create custom marker icon based on event type
const createCustomIcon = (eventType: string, isSelected: boolean = false) => {
  const eventInfo = getEventTypeInfo(eventType);
  const size = isSelected ? 35 : 25;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${eventInfo.color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 30 ? '14px' : '12px'};
        ${isSelected ? 'animation: pulse 2s infinite;' : ''}
      ">
        ${eventType.charAt(0).toUpperCase()}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default function EventMapClient({ events, selectedEventId, onEventSelect }: EventMapClientProps) {
  const validEvents = events.filter(event => {
    const coords = parseCoordinates(event.location.gps);
    return coords !== null;
  });

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[62.0, 15.0]}
        zoom={5}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster: any) => {
            const childCount = cluster.getChildCount();
            const size = childCount < 10 ? 'small' : childCount < 100 ? 'medium' : 'large';
            
            return L.divIcon({
              html: `<div><span>${childCount}</span></div>`,
              className: `marker-cluster marker-cluster-${size}`,
              iconSize: L.point(40, 40, true),
            });
          }}
        >
          {validEvents.map((event) => {
            const coords = parseCoordinates(event.location.gps);
            if (!coords) return null;
            
            const isSelected = event.id === selectedEventId;
            
            return (
              <Marker
                key={event.id}
                position={coords}
                icon={createCustomIcon(event.type, isSelected)}
                eventHandlers={{
                  click: () => {
                    console.log('Marker clicked:', event.id, event.type);
                    onEventSelect?.(event);
                  },
                }}
              >
                <Popup>
                  <div className="max-w-sm">
                    <div className="flex items-start gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: getEventTypeInfo(event.type).color }}
                      />
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">
                          {event.type}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {event.location.name}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-800 mb-2">
                      {event.summary}
                    </p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{formatDateTime(event.datetime)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Popup button clicked:', event.id, event.type);
                          onEventSelect?.(event);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Visa mer
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-1000 flex flex-col gap-2">
        <button
          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          onClick={() => {
            // Reset map view to Sweden
            window.location.reload(); // Simple reset for now
          }}
          title="Återställ vy"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0H8v0z" />
          </svg>
        </button>
      </div>
      
      {/* Events counter */}
      <div className="absolute bottom-4 left-4 z-1000 bg-white px-3 py-2 rounded-lg shadow-md">
        <p className="text-sm font-medium text-gray-700">
          {validEvents.length} händelser
        </p>
      </div>
    </div>
  );
}