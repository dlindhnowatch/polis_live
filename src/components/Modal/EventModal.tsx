'use client';

import { useEffect } from 'react';
import { PoliceEvent } from '@/types/police';
import { getEventTypeInfo, formatDateTime } from '@/utils/eventHelpers';
import { X, MapPin, Clock, ExternalLink, Share2, Copy } from 'lucide-react';

interface EventModalProps {
  event: PoliceEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  console.log('EventModal render:', { isOpen, eventId: event?.id });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/?event=${event?.id}`;
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: `Polishändelse: ${event.type}`,
          text: `${event.summary} - ${event.location.name}`,
          url: `${window.location.origin}/?event=${event.id}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen || !event) return null;

  const eventInfo = getEventTypeInfo(event.type);

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: eventInfo.color }}
              />
              <h2 className="text-xl font-semibold text-gray-900">
                {event.type}
              </h2>
              <span className="text-sm text-gray-600">#{event.id}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Dela händelse"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Stäng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Event Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {event.name}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {event.summary}
                </p>
              </div>
              
              {/* Location and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Plats</p>
                    <p className="text-gray-700">{event.location.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {event.location.gps}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Tid</p>
                    <p className="text-gray-700">{formatDateTime(event.datetime)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Preview (if coordinates available) */}
            {event.location.gps && (() => {
              const coords = event.location.gps.split(',').map(c => parseFloat(c.trim()));
              const isValidCoords = coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
              
              if (!isValidCoords) return null;
              
              const [lat, lng] = coords;
              // Create a small bounding box around the point for the iframe
              const offset = 0.01; // roughly 1km
              const bbox = [lng - offset, lat - offset, lng + offset, lat + offset].join(',');
              
              return (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Karta</h4>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
                      className="w-full h-full border-0"
                      title="Händelsekarta"
                      loading="lazy"
                    />
                  </div>
                </div>
              );
            })()}

            {/* Official Link */}
            {event.url && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Mer information</h4>
                <a
                  href={`https://polisen.se${event.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Se på polisen.se
                </a>
              </div>
            )}
            
            {/* Event Type Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Händelsetyp</h4>
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: eventInfo.color }}
                />
                <div>
                  <p className="font-medium text-gray-800">{event.type}</p>
                  <p className="text-sm text-gray-700">
                    Händelse rapporterad till Polisen
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <p>
                Data från{' '}
                <a 
                  href="https://polisen.se" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  polisen.se
                </a>
              </p>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Copy className="w-4 h-4" />
                Kopiera länk
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}