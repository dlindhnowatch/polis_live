import { EventTypeInfo } from '@/types/police';
import { 
  Car, 
  Shield, 
  Flame, 
  Home, 
  ShoppingBag, 
  Wine, 
  Pill, 
  Banknote, 
  Hammer, 
  AlertTriangle,
  Wrench,
  HelpCircle
} from 'lucide-react';

export const EVENT_TYPE_COLORS: Record<string, EventTypeInfo> = {
  'Trafikolycka': {
    name: 'Trafikolycka',
    color: '#FF6B6B',
    icon: 'Car'
  },
  'Misshandel': {
    name: 'Misshandel',
    color: '#EE5A6F',
    icon: 'Shield'
  },
  'Brand': {
    name: 'Brand',
    color: '#FF8C42',
    icon: 'Flame'
  },
  'Inbrott': {
    name: 'Inbrott',
    color: '#9B59B6',
    icon: 'Home'
  },
  'Stöld': {
    name: 'Stöld',
    color: '#8E44AD',
    icon: 'ShoppingBag'
  },
  'Rattfylleri': {
    name: 'Rattfylleri',
    color: '#E67E22',
    icon: 'Wine'
  },
  'Narkotikabrott': {
    name: 'Narkotikabrott',
    color: '#C0392B',
    icon: 'Pill'
  },
  'Rån': {
    name: 'Rån',
    color: '#E74C3C',
    icon: 'Banknote'
  },
  'Skadegörelse': {
    name: 'Skadegörelse',
    color: '#34495E',
    icon: 'Hammer'
  },
  'Trafikbrott': {
    name: 'Trafikbrott',
    color: '#F39C12',
    icon: 'AlertTriangle'
  },
  'Arbetsplatsolycka': {
    name: 'Arbetsplatsolycka',
    color: '#D35400',
    icon: 'Wrench'
  },
  'default': {
    name: 'Övrigt',
    color: '#95A5A6',
    icon: 'HelpCircle'
  }
};

export const getEventTypeInfo = (type: string): EventTypeInfo => {
  return EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS.default;
};

export const formatDateTime = (datetime: string): string => {
  return new Date(datetime).toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const parseCoordinates = (gps: string): [number, number] | null => {
  const coords = gps.split(',').map(coord => parseFloat(coord.trim()));
  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    return [coords[0], coords[1]];
  }
  return null;
};