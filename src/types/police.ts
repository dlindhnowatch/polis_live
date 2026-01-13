export interface PoliceEvent {
  id: number;
  datetime: string;
  name: string;
  summary: string;
  url: string;
  type: string;
  location: {
    name: string;
    gps: string;
  };
}

export interface EventFilters {
  dateTime?: string;
  locationName?: string;
  eventType?: string;
  searchQuery?: string;
}

export interface EventTypeInfo {
  name: string;
  color: string;
  icon: string;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedEventId: number | null;
}