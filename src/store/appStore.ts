import { create } from 'zustand';
import { PoliceEvent, EventFilters, MapState } from '@/types/police';

interface AppStore {
  // Events
  events: PoliceEvent[];
  setEvents: (events: PoliceEvent[]) => void;
  
  // Loading and Error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Filters
  filters: EventFilters;
  setFilters: (filters: EventFilters) => void;
  clearFilters: () => void;
  
  // Map state
  mapState: MapState;
  setMapState: (mapState: Partial<MapState>) => void;
  
  // Selected event
  selectedEvent: PoliceEvent | null;
  setSelectedEvent: (event: PoliceEvent | null) => void;
  
  // UI state
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Events
  events: [],
  setEvents: (events) => set({ events }),
  
  // Loading and Error states
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
  
  // Filters
  filters: {},
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  
  // Map state (centered on Sweden)
  mapState: {
    center: [62.0, 15.0],
    zoom: 5,
    selectedEventId: null,
  },
  setMapState: (newMapState) => set((state) => ({
    mapState: { ...state.mapState, ...newMapState }
  })),
  
  // Selected event
  selectedEvent: null,
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  
  // UI state
  isSidebarOpen: true,
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  isModalOpen: false,
  setIsModalOpen: (isModalOpen) => set({ isModalOpen }),
}));