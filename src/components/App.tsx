'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/appStore';
import { usePoliceEvents } from '@/hooks/usePoliceEvents';
import { useNotificationChecker } from '@/hooks/useNotificationChecker';
import EventMap from '@/components/Map/EventMap';
import EventList from '@/components/EventList/EventList';
import Filters from '@/components/Filters/Filters';
import EventModal from '@/components/Modal/EventModal';
import Logo from '@/components/Logo/Logo';
import NotificationPanel from '@/components/NotificationPanel/NotificationPanel';
import NotificationToast from '@/components/NotificationPanel/NotificationToast';
import { PoliceEvent } from '@/types/police';

const queryClient = new QueryClient();

function PoliceEventsApp() {
  const {
    filters,
    setFilters,
    selectedEvent,
    setSelectedEvent,
    isSidebarOpen,
    setIsSidebarOpen,
    isModalOpen,
    setIsModalOpen,
    mobileView,
    setMobileView,
  } = useAppStore();

  const { data: events = [], isLoading, error } = usePoliceEvents(filters);

  // Check for new events that match notification rules
  useNotificationChecker(events);

  const handleEventSelect = (event: PoliceEvent) => {
    console.log('Event selected in App:', event.id, event.type);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Keep selected event for map highlighting
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Något gick fel
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header with Logo and Filters */}
      <header className="flex-none">
        <Logo events={events} onEventSelect={handleEventSelect} />
        <Filters
          filters={filters}
          onFiltersChange={setFilters}
          eventCount={events.length}
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop Layout: Side by side */}
        <div className="hidden lg:flex lg:flex-1">
          {/* Event List Sidebar - Desktop only */}
          <aside className={`
            flex-none transition-all duration-300 ease-in-out
            lg:flex lg:w-96
            ${isSidebarOpen ? '' : 'lg:w-auto'}
          `}>
            <EventList
              events={events}
              selectedEventId={selectedEvent?.id}
              onEventSelect={handleEventSelect}
              isLoading={isLoading}
              isCollapsed={!isSidebarOpen}
              onToggleCollapse={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </aside>

          {/* Map - Desktop */}
          <section className="flex-1 relative">
            <EventMap
              events={events}
              selectedEventId={selectedEvent?.id}
              onEventSelect={handleEventSelect}
            />
          </section>
        </div>

        {/* Mobile Layout: Toggle between map and list */}
        <div className="flex-1 lg:hidden flex flex-col">
          {/* Mobile View Toggle Buttons */}
          <div className="flex-none bg-white shadow-lg m-4 rounded-lg p-1 z-30">
            <div className="flex">
              <button
                onClick={() => setMobileView('list')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mobileView === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setMobileView('map')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mobileView === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Karta
              </button>
            </div>
          </div>

          {/* Mobile Content Area */}
          <div className="flex-1 mx-4 mb-4 flex flex-col">
            {/* Mobile List View */}
            {mobileView === 'list' && (
              <div className="flex-1 flex flex-col rounded-lg bg-white shadow-lg overflow-hidden">
                <EventList
                  events={events}
                  selectedEventId={selectedEvent?.id}
                  onEventSelect={handleEventSelect}
                  isLoading={isLoading}
                  isCollapsed={false}
                  onToggleCollapse={() => {}}
                  isMobile={true}
                />
              </div>
            )}

            {/* Mobile Map View */}
            {mobileView === 'map' && (
              <div className="h-full rounded-lg overflow-hidden">
                <EventMap
                  events={events}
                  selectedEventId={selectedEvent?.id}
                  onEventSelect={handleEventSelect}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Event Detail Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      {/* Notification Panel */}
      <NotificationPanel />
      
      {/* Notification Toasts */}
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PoliceEventsApp />
    </QueryClientProvider>
  );
}