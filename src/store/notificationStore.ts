import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PoliceEvent } from '@/types/police';
import { getRegionForLocation } from '@/utils/regionMappingSecure';

export interface NotificationRule {
  id: string;
  name: string;
  type: 'region' | 'city' | 'event_type';
  value: string;
  enabled: boolean;
  createdAt: Date;
}

export interface NotificationAlert {
  id: string;
  event: PoliceEvent;
  rule: NotificationRule;
  timestamp: Date;
  dismissed: boolean;
}

interface NotificationState {
  rules: NotificationRule[];
  alerts: NotificationAlert[];
  audioEnabled: boolean;
  lastCheckedEventId: number | null;
  isNotificationPanelOpen: boolean;
  
  // Rule management
  addRule: (rule: Omit<NotificationRule, 'id' | 'createdAt'>) => void;
  removeRule: (ruleId: string) => void;
  toggleRule: (ruleId: string) => void;
  
  // Alert management
  addAlert: (alert: Omit<NotificationAlert, 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  
  // Settings
  toggleAudio: () => void;
  setLastCheckedEventId: (eventId: number) => void;
  setNotificationPanelOpen: (open: boolean) => void;
  
  // Check for new events that match rules
  checkNewEvents: (events: PoliceEvent[]) => void;
}

const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      rules: [],
      alerts: [],
      audioEnabled: true,
      lastCheckedEventId: null,
      isNotificationPanelOpen: false,
      
      addRule: (ruleData) => {
        const rule: NotificationRule = {
          ...ruleData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
        };
        set((state) => ({
          rules: [...state.rules, rule],
        }));
      },
      
      removeRule: (ruleId) => {
        set((state) => ({
          rules: state.rules.filter((rule) => rule.id !== ruleId),
        }));
      },
      
      toggleRule: (ruleId) => {
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
          ),
        }));
      },
      
      addAlert: (alertData) => {
        const alert: NotificationAlert = {
          ...alertData,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          dismissed: false,
        };
        
        set((state) => ({
          alerts: [alert, ...state.alerts],
        }));
        
        // Play sound if enabled
        if (get().audioEnabled) {
          playNotificationSound();
        }
        
        // Show browser notification if supported
        showBrowserNotification(alert);
      },
      
      dismissAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, dismissed: true } : alert
          ),
        }));
      },
      
      clearAllAlerts: () => {
        set((state) => ({
          alerts: state.alerts.map((alert) => ({ ...alert, dismissed: true })),
        }));
      },
      
      toggleAudio: () => {
        set((state) => ({
          audioEnabled: !state.audioEnabled,
        }));
      },
      
      setLastCheckedEventId: (eventId) => {
        set({ lastCheckedEventId: eventId });
      },
      
      setNotificationPanelOpen: (open) => {
        set({ isNotificationPanelOpen: open });
      },
      
      checkNewEvents: (events) => {
        const { rules, lastCheckedEventId } = get();
        const enabledRules = rules.filter((rule) => rule.enabled);
        
        if (enabledRules.length === 0 || events.length === 0) {
          return;
        }
        
        // Find new events (events with ID higher than last checked)
        const newEvents = lastCheckedEventId 
          ? events.filter((event) => event.id > lastCheckedEventId)
          : [];
        
        if (newEvents.length > 0) {
          // Update last checked ID
          const maxEventId = Math.max(...events.map(e => e.id));
          set({ lastCheckedEventId: maxEventId });
          
          // Check each new event against rules
          newEvents.forEach((event) => {
            enabledRules.forEach((rule) => {
              if (eventMatchesRule(event, rule)) {
                get().addAlert({ event, rule });
              }
            });
          });
        } else if (lastCheckedEventId === null && events.length > 0) {
          // First time - just set the last checked ID without triggering alerts
          const maxEventId = Math.max(...events.map(e => e.id));
          set({ lastCheckedEventId: maxEventId });
        }
      },
    }),
    {
      name: 'police-notifications',
      partialize: (state) => ({
        rules: state.rules,
        audioEnabled: state.audioEnabled,
        lastCheckedEventId: state.lastCheckedEventId,
      }),
    }
  )
);

function eventMatchesRule(event: PoliceEvent, rule: NotificationRule): boolean {
  switch (rule.type) {
    case 'region':
      const eventRegion = getRegionForLocation(event.location.name);
      return eventRegion === rule.value;
    
    case 'city':
      return event.location.name.toLowerCase().includes(rule.value.toLowerCase());
    
    case 'event_type':
      return event.type.toLowerCase().includes(rule.value.toLowerCase());
    
    default:
      return false;
  }
}

function playNotificationSound() {
  try {
    // Create audio context for beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Frequency in Hz
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

function showBrowserNotification(alert: NotificationAlert) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Ny polishändelse', {
      body: `${alert.event.type} i ${alert.event.location.name}`,
      icon: '/favicon.ico',
      tag: alert.id,
    });
  }
}

export default useNotificationStore;