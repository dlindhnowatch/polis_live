'use client';

import { useState } from 'react';
import { Calendar, Archive, RefreshCw } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  onToggleArchive?: () => void;
  showArchiveToggle?: boolean;
  isArchiveMode?: boolean;
  availableDateRange?: { earliest: string; latest: string };
  onRefreshCache?: () => void;
}

export default function DateRangeSelector({
  dateRange,
  onDateRangeChange,
  onToggleArchive,
  showArchiveToggle = false,
  isArchiveMode = false,
  availableDateRange,
  onRefreshCache
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sv-SE');
  };

  const getPresetRanges = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return [
      {
        label: 'Idag',
        range: {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        }
      },
      {
        label: 'Igår',
        range: {
          startDate: yesterday.toISOString().split('T')[0],
          endDate: yesterday.toISOString().split('T')[0]
        }
      },
      {
        label: 'Senaste veckan',
        range: {
          startDate: lastWeek.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        }
      },
      {
        label: 'Senaste månaden',
        range: {
          startDate: lastMonth.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        }
      }
    ];
  };

  const handlePresetClick = (preset: { label: string; range: DateRange }) => {
    onDateRangeChange(preset.range);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Date Range Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white/90 hover:bg-white backdrop-blur px-4 py-2 rounded-lg transition-colors text-gray-800 hover:text-gray-900"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatDate(dateRange.startDate)}
            {dateRange.startDate !== dateRange.endDate && (
              <> - {formatDate(dateRange.endDate)}</>
            )}
          </span>
        </button>

        {/* Archive Toggle */}
        {showArchiveToggle && (
          <button
            onClick={onToggleArchive}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isArchiveMode
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-white/90 hover:bg-white backdrop-blur text-gray-800 hover:text-gray-900'
            }`}
            title={isArchiveMode ? 'Visa aktuella händelser' : 'Visa arkiverade händelser'}
          >
            <Archive className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isArchiveMode ? 'Arkiv' : 'Aktuellt'}
            </span>
          </button>
        )}

        {/* Refresh Cache Button */}
        {onRefreshCache && (
          <button
            onClick={onRefreshCache}
            className="flex items-center gap-2 bg-white/90 hover:bg-white backdrop-blur px-3 py-2 rounded-lg transition-colors text-gray-800 hover:text-gray-900"
            title="Uppdatera cache"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 p-4">
            <div className="space-y-4">
              {/* Custom Date Range */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Välj datumintervall</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Från</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => onDateRangeChange({
                        ...dateRange,
                        startDate: e.target.value
                      })}
                      min={availableDateRange?.earliest}
                      max={availableDateRange?.latest}
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Till</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => onDateRangeChange({
                        ...dateRange,
                        endDate: e.target.value
                      })}
                      min={availableDateRange?.earliest}
                      max={availableDateRange?.latest}
                      className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Snabbval</h4>
                <div className="space-y-1">
                  {getPresetRanges().map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetClick(preset)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Date Range Info */}
              {availableDateRange && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Tillgängligt: {formatDate(availableDateRange.earliest)} - {formatDate(availableDateRange.latest)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}