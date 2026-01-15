'use client';

import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePoliceEvents, useCachedEvents, useAvailableDateRange, useCacheMetadata, useSharedCacheStats } from '@/hooks/usePoliceEvents';
import { SWEDISH_REGIONS, REGION_DISPLAY_NAMES, getAvailableRegions } from '@/utils/regions';
import { getRegionForLocation } from '@/utils/regionMappingSecure';
import { EVENT_TYPE_COLORS, getEventTypeInfo } from '@/utils/eventHelpers';
import { PoliceEvent } from '@/types/police';
import { DateRange } from '@/services/eventCache';
import Link from 'next/link';
import EventModal from '@/components/Modal/EventModal';
import DateRangeSelector from '@/components/DateRangeSelector/DateRangeSelector';
import {
  Shield,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  ChevronDown,
  ArrowLeft,
  AlertTriangle,
  Activity,
  Users,
  Minus,
} from 'lucide-react';

const queryClient = new QueryClient();

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

function StatCard({ title, value, subtitle, icon, trend, trendValue, color = 'blue' }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-green-500 mr-1" />}
              {trend === 'neutral' && <Minus className="w-4 h-4 text-gray-400 mr-1" />}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-red-600' : 
                trend === 'down' ? 'text-green-600' : 
                'text-gray-600'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface EventTypeBarProps {
  type: string;
  count: number;
  maxCount: number;
  color: string;
}

function EventTypeBar({ type, count, maxCount, color }: EventTypeBarProps) {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-sm font-medium text-gray-700 truncate" title={type}>
        {type}
      </div>
      <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
          style={{ width: `${Math.max(percentage, 8)}%`, backgroundColor: color }}
        >
          <span className="text-xs font-bold text-white">{count}</span>
        </div>
      </div>
    </div>
  );
}

interface TimeDistributionProps {
  events: PoliceEvent[];
}

function TimeDistribution({ events }: TimeDistributionProps) {
  const hourCounts = useMemo(() => {
    const counts = new Array(24).fill(0);
    events.forEach((event) => {
      const dateObj = new Date(event.datetime);
      const hour = dateObj.getHours();
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        counts[hour]++;
      }
    });
    return counts;
  }, [events]);

  const maxCount = Math.max(...hourCounts, 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Händelser per timme</h3>
      </div>
      <div className="flex items-end justify-between h-40 gap-1">
        {hourCounts.map((count, hour) => {
          const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const pixelHeight = maxCount > 0 ? Math.max((count / maxCount) * 160, count > 0 ? 8 : 0) : 0; // 160px = h-40
          return (
            <div key={hour} className="flex-1 flex flex-col items-end justify-end h-full">
              <div 
                className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-all duration-300"
                style={{ 
                  height: `${pixelHeight}px`,
                  minHeight: count > 0 ? '8px' : '0px'
                }}
                title={`${hour}:00 - ${count} händelser`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
}

interface RecentEventsListProps {
  events: PoliceEvent[];
  onEventSelect: (event: PoliceEvent) => void;
}

function RecentEventsList({ events, onEventSelect }: RecentEventsListProps) {
  const recentEvents = events.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Senaste händelser</h3>
      </div>
      <div className="space-y-3">
        {recentEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Inga händelser i denna region</p>
        ) : (
          recentEvents.map(event => {
            const eventInfo = getEventTypeInfo(event.type);
            return (
              <div
                key={event.id}
                onClick={() => onEventSelect(event)}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: eventInfo.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.type}</p>
                  <p className="text-xs text-gray-500 truncate">{event.location.name}</p>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(event.datetime).toLocaleTimeString('sv-SE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface DayDistributionProps {
  events: PoliceEvent[];
}

function DayDistribution({ events }: DayDistributionProps) {
  const dayCounts = useMemo(() => {
    const days = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
    const counts = new Array(7).fill(0);
    events.forEach(event => {
      const day = new Date(event.datetime).getDay();
      counts[day]++;
    });
    return days.map((name, index) => ({ name, count: counts[index] }));
  }, [events]);

  const maxCount = Math.max(...dayCounts.map(d => d.count), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Händelser per veckodag</h3>
      </div>
      <div className="space-y-3">
        {dayCounts.map(({ name, count }) => {
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div key={name} className="flex items-center gap-3">
              <div className="w-10 text-sm font-medium text-gray-700">{name}</div>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(percentage, 8)}%` }}
                >
                  {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatisticsDashboardContent() {
  const [selectedRegion, setSelectedRegion] = useState<string>('Hela Sverige');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PoliceEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Date range and archive state
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date().toISOString().split('T')[0];
    return { startDate: today, endDate: today };
  });
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [useHistoricalData, setUseHistoricalData] = useState(false);
  
  // Data fetching
  const { data: currentEvents = [], isLoading: isLoadingCurrent } = usePoliceEvents({});
  const { data: historicalEvents = [], isLoading: isLoadingHistorical } = useCachedEvents(
    useHistoricalData ? dateRange : undefined, 
    isArchiveMode
  );
  const { data: availableDateRange } = useAvailableDateRange();
  const { data: cacheMetadata } = useCacheMetadata();
  const { data: sharedCacheStats } = useSharedCacheStats();
  
  // Choose which events to use
  const allEvents = useHistoricalData ? historicalEvents : currentEvents;
  const isLoading = useHistoricalData ? isLoadingHistorical : isLoadingCurrent;

  // Get available regions that have data, sorted alphabetically with 'Hela Sverige' at top
  const availableRegions = useMemo(() => {
    try {
      const regions = getAvailableRegions();
      // Sort alphabetically
      const sortedRegions = [...regions].sort((a, b) => {
        const displayA = REGION_DISPLAY_NAMES[a] || a;
        const displayB = REGION_DISPLAY_NAMES[b] || b;
        return displayA.localeCompare(displayB, 'sv');
      });
      // Add 'Hela Sverige' at the beginning
      return ['Hela Sverige', ...sortedRegions];
    } catch (error) {
      console.error('Error loading available regions:', error);
      const sortedRegions = [...SWEDISH_REGIONS].sort((a, b) => {
        const displayA = REGION_DISPLAY_NAMES[a] || a;
        const displayB = REGION_DISPLAY_NAMES[b] || b;
        return displayA.localeCompare(displayB, 'sv');
      });
      return ['Hela Sverige', ...sortedRegions];
    }
  }, []);

  // Filter events for selected region using secure mapping
  const regionEvents = useMemo(() => {
    if (selectedRegion === 'Hela Sverige') {
      return allEvents; // Return all events for Sweden
    }
    return allEvents.filter(event => {
      const eventRegion = getRegionForLocation(event.location.name);
      return eventRegion === selectedRegion;
    });
  }, [allEvents, selectedRegion]);

  const handleEventSelect = (event: PoliceEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    setUseHistoricalData(true);
  };

  const handleToggleArchive = () => {
    setIsArchiveMode(!isArchiveMode);
    setUseHistoricalData(true);
  };

  const handleRefreshCache = async () => {
    // Force refresh current events to update cache
    window.location.reload();
  };

  const handleBackToCurrent = () => {
    setUseHistoricalData(false);
    setIsArchiveMode(false);
    const today = new Date().toISOString().split('T')[0];
    setDateRange({ startDate: today, endDate: today });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const eventTypeCounts: Record<string, number> = {};
    regionEvents.forEach(event => {
      eventTypeCounts[event.type] = (eventTypeCounts[event.type] || 0) + 1;
    });

    const sortedTypes = Object.entries(eventTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    const maxTypeCount = sortedTypes.length > 0 ? sortedTypes[0][1] : 0;

    // Get today's events
    const today = new Date().toISOString().slice(0, 10);
    const todayEvents = regionEvents.filter(e => e.datetime.startsWith(today));

    // Get yesterday's events for comparison
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const yesterdayEvents = regionEvents.filter(e => e.datetime.startsWith(yesterday));

    // Most common type
    const mostCommonType = sortedTypes.length > 0 ? sortedTypes[0][0] : 'N/A';

    // Unique locations
    const uniqueLocations = new Set(regionEvents.map(e => e.location.name)).size;

    return {
      total: regionEvents.length,
      todayCount: todayEvents.length,
      yesterdayCount: yesterdayEvents.length,
      eventTypeCounts: sortedTypes,
      maxTypeCount,
      mostCommonType,
      uniqueLocations,
    };
  }, [regionEvents, allEvents, selectedRegion]);

  const trend = stats.todayCount > stats.yesterdayCount ? 'up' : 
                stats.todayCount < stats.yesterdayCount ? 'down' : 'neutral';
  const trendDiff = Math.abs(stats.todayCount - stats.yesterdayCount);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Laddar statistik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Tillbaka</span>
                </Link>
                <div className="h-6 w-px bg-blue-700" />
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-300" />
                  <h1 className="text-2xl font-bold">
                    {isArchiveMode ? 'Statistik - Arkiv' : useHistoricalData ? 'Statistik - Historik' : 'Statistik'}
                  </h1>
                </div>
              </div>
              
              {/* Region Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-between"
                >
                  <MapPin className="w-5 h-5 text-blue-300" />
                  <span className="font-medium">{selectedRegion === 'Hela Sverige' ? 'Hela Sverige' : (REGION_DISPLAY_NAMES[selectedRegion] || selectedRegion)}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
                      {availableRegions.map(region => (
                        <button
                          key={region}
                          onClick={() => {
                            setSelectedRegion(region);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                            selectedRegion === region ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {region === 'Hela Sverige' ? 'Hela Sverige' : (REGION_DISPLAY_NAMES[region] || region)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Date Range and Archive Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <DateRangeSelector
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onToggleArchive={handleToggleArchive}
                showArchiveToggle={true}
                isArchiveMode={isArchiveMode}
                availableDateRange={availableDateRange || undefined}
                onRefreshCache={handleRefreshCache}
              />
              
              {/* Mode Indicators and Controls */}
              <div className="flex items-center gap-2">
                {useHistoricalData && (
                  <button
                    onClick={handleBackToCurrent}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    Tillbaka till aktuellt
                  </button>
                )}
                
                {/* Cache Information */}
                <div className="flex flex-col items-end gap-1">
                  {cacheMetadata && (
                    <div className="text-xs text-blue-200">
                      Lokal: {cacheMetadata.totalEvents} händelser
                    </div>
                  )}
                  {sharedCacheStats && (
                    <div className="text-xs text-blue-300">
                      Delad: {sharedCacheStats.totalEvents} händelser ({sharedCacheStats.contributors.length} bidragsgivare)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Totalt antal händelser"
            value={stats.total}
            subtitle="I vald region"
            icon={<BarChart3 className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Händelser idag"
            value={stats.todayCount}
            trend={trend}
            trendValue={`${trend === 'up' ? '+' : trend === 'down' ? '-' : ''}${trendDiff} jmf igår`}
            icon={<Activity className="w-6 h-6" />}
            color={trend === 'up' ? 'red' : trend === 'down' ? 'green' : 'yellow'}
          />
          <StatCard
            title="Vanligaste händelse"
            value={stats.mostCommonType}
            subtitle={stats.eventTypeCounts[0] ? `${stats.eventTypeCounts[0][1]} st` : ''}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="orange"
          />
          <StatCard
            title="Unika platser"
            value={stats.uniqueLocations}
            subtitle="I regionen"
            icon={<MapPin className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Event Type Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Händelsetyper</h3>
            </div>
            <div className="space-y-4">
              {stats.eventTypeCounts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Inga händelser att visa</p>
              ) : (
                stats.eventTypeCounts.map(([type, count]) => {
                  const eventInfo = getEventTypeInfo(type);
                  return (
                    <EventTypeBar
                      key={type}
                      type={type}
                      count={count}
                      maxCount={stats.maxTypeCount}
                      color={eventInfo.color}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Events */}
          <RecentEventsList events={regionEvents} onEventSelect={handleEventSelect} />
        </div>

        {/* Time Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeDistribution events={regionEvents} />
          <DayDistribution events={regionEvents} />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data hämtas från Polisens öppna API. Statistiken baseras på de senaste 500 händelserna.</p>
          <p className="mt-1">Senast uppdaterad: {new Date().toLocaleString('sv-SE')}</p>
          <p className="mt-1">
            {regionEvents.length} av {allEvents.length} händelser matchade region {REGION_DISPLAY_NAMES[selectedRegion] || selectedRegion}
          </p>
        </div>
      </main>

      {/* Event Detail Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default function StatisticsDashboard() {
  return (
    <div className="statistics-dashboard">
      <QueryClientProvider client={queryClient}>
        <StatisticsDashboardContent />
      </QueryClientProvider>
    </div>
  );
}
