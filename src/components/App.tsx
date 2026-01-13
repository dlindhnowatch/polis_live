'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/appStore';
import { usePoliceEvents } from '@/hooks/usePoliceEvents';
import EventMap from '@/components/Map/EventMap';
import EventList from '@/components/EventList/EventList';
import Filters from '@/components/Filters/Filters';
import EventModal from '@/components/Modal/EventModal';
import Logo from '@/components/Logo/Logo';
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
  } = useAppStore();

  const { data: events = [], isLoading, error } = usePoliceEvents(filters);

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
        {/* Event List Sidebar - Mobile: Bottom Sheet, Desktop: Sidebar */}
        <aside className={`
          flex-none transition-all duration-300 ease-in-out z-20
          lg:flex lg:w-96
          ${isSidebarOpen 
            ? 'fixed inset-x-0 bottom-0 h-2/3 lg:relative lg:h-auto lg:inset-auto' 
            : 'hidden lg:w-auto'
          }
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

        {/* Map */}
        <section className="flex-1 relative">
          <EventMap
            events={events}
            selectedEventId={selectedEvent?.id}
            onEventSelect={handleEventSelect}
          />
          
          {/* Mobile: Floating Action Button to toggle sidebar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden fixed bottom-4 right-4 z-30 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Mobile: Backdrop overlay */}
          {isSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </section>
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PoliceEventsApp />
    </QueryClientProvider>
  );
}