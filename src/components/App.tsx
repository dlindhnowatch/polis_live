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
import LatestNews from '@/components/LatestNews/LatestNews';
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
        <Logo />
        <Filters
          filters={filters}
          onFiltersChange={setFilters}
          eventCount={events.length}
        />
      </header>

      {/* Latest News Section */}
      <section className="flex-none mx-4 my-4">
        <LatestNews 
          events={events} 
          onEventSelect={handleEventSelect}
        />
      </section>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Event List Sidebar */}
        <aside className={`
          flex-none transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-96' : 'w-auto'}
          lg:block
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
        <section className="flex-1">
          <EventMap
            events={events}
            selectedEventId={selectedEvent?.id}
            onEventSelect={handleEventSelect}
          />
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