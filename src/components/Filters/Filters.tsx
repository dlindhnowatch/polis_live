'use client';

import { useState, useEffect } from 'react';
import { EventFilters } from '@/types/police';
import { EVENT_TYPE_COLORS } from '@/utils/eventHelpers';
import { Search, Filter, X, Calendar, MapPin, Tag } from 'lucide-react';

interface FiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  eventCount?: number;
}

export default function Filters({ filters, onFiltersChange, eventCount }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<EventFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<EventFilters>) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFilterCount = Object.values(localFilters).filter(Boolean).length;

  const popularEventTypes = [
    'Trafikolycka',
    'Inbrott', 
    'Stöld',
    'Misshandel',
    'Rattfylleri',
    'Narkotikabrott'
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Compact Filter Bar */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Sök händelser, platser, typ..."
              value={localFilters.searchQuery || ''}
              onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {localFilters.searchQuery && (
              <button
                onClick={() => handleFilterChange({ searchQuery: undefined })}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
              ${activeFilterCount > 0 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Rensa
            </button>
          )}
        </div>

        {/* Event Count */}
        {eventCount !== undefined && (
          <div className="mt-2 text-sm text-gray-800">
            {eventCount} händelser
            {activeFilterCount > 0 && ' (filtrerade)'}
          </div>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Date Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Datum
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                onClick={() => handleFilterChange({ 
                  dateTime: new Date().toISOString().slice(0, 10) 
                })}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  localFilters.dateTime?.includes(new Date().toISOString().slice(0, 10))
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Idag
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  handleFilterChange({ 
                    dateTime: yesterday.toISOString().slice(0, 10) 
                  });
                }}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  localFilters.dateTime?.includes(new Date(Date.now() - 86400000).toISOString().slice(0, 10))
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Igår
              </button>
              <input
                type="date"
                value={localFilters.dateTime?.slice(0, 10) || ''}
                onChange={(e) => handleFilterChange({ 
                  dateTime: e.target.value 
                })}
                className="px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Plats
            </label>
            <input
              type="text"
              placeholder="t.ex. Stockholm, Göteborg, Malmö"
              value={localFilters.locationName || ''}
              onChange={(e) => handleFilterChange({ locationName: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separera flera platser med semicolon (;)
            </p>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              Händelsetyp
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {popularEventTypes.map((eventType) => {
                const isSelected = localFilters.eventType?.split(';').includes(eventType);
                const eventInfo = EVENT_TYPE_COLORS[eventType];
                
                return (
                  <button
                    key={eventType}
                    onClick={() => {
                      const currentTypes = localFilters.eventType?.split(';').filter(Boolean) || [];
                      let newTypes;
                      
                      if (isSelected) {
                        newTypes = currentTypes.filter(type => type !== eventType);
                      } else {
                        newTypes = [...currentTypes, eventType];
                      }
                      
                      handleFilterChange({
                        eventType: newTypes.length > 0 ? newTypes.join(';') : undefined
                      });
                    }}
                    className={`
                      flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-colors text-left
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: eventInfo.color }}
                    />
                    <span className="truncate">{eventType}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Custom Event Type Input */}
            <div className="mt-2">
              <input
                type="text"
                placeholder="Eller skriv egen typ (separera med ;)"
                value={localFilters.eventType || ''}
                onChange={(e) => handleFilterChange({ eventType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}