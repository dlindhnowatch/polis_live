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
  // Larger markers on mobile for better touch interaction
  const baseSize = window.innerWidth < 768 ? 28 : 25;
  const size = isSelected ? baseSize + 8 : baseSize;
  
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
        cursor: pointer;
        touch-action: manipulation;
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
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        bounceAtZoomLimits={true}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          tileSize={256}
          updateWhenIdle={false}
          updateWhenZooming={false}
          keepBuffer={2}
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
      
      {/* Mobile-optimized Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Zoom In */}
        <button
          className="bg-white p-3 md:p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors touch-manipulation"
          onClick={() => {
            const container = document.querySelector('.leaflet-container') as any;
            if (container?.__map) container.__map.zoomIn();
          }}
          title="Zooma in"
        >
          <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        {/* Zoom Out */}
        <button
          className="bg-white p-3 md:p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors touch-manipulation"
          onClick={() => {
            const container = document.querySelector('.leaflet-container') as any;
            if (container?.__map) container.__map.zoomOut();
          }}
          title="Zooma ut"
        >
          <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        
        {/* Reset View */}
        <button
          className="bg-white p-3 md:p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors touch-manipulation"
          onClick={() => {
            const container = document.querySelector('.leaflet-container') as any;
            if (container?.__map) {
              container.__map.setView([62.0, 15.0], 5);
            }
          }}
          title="Återställ vy"
        >
          <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        {/* My Location (if geolocation available) */}
        <button
          className="bg-white p-3 md:p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors touch-manipulation"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                const container = document.querySelector('.leaflet-container') as any;
                if (container?.__map) {
                  container.__map.setView([position.coords.latitude, position.coords.longitude], 10);
                }
              });
            }
          }}
          title="Min plats"
        >
          <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      
      {/* Mobile-responsive Events counter */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md">
        <p className="text-xs md:text-sm font-medium text-gray-700">
          {validEvents.length} händelser
        </p>
      </div>
      
      {/* Mobile: Touch instruction overlay (shows briefly on first load) */}
      <div className="md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg pointer-events-none opacity-0 animate-fade-in-out">
        <p className="text-sm text-center">
          👆 Tryck på markering för detaljer
        </p>
      </div>
    </div>
  );
}