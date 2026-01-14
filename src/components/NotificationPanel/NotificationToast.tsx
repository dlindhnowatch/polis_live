'use client';

import { useEffect, useState } from 'react';
import { useHydratedNotificationStore } from '@/hooks/useHydratedNotificationStore';
import { X, Bell, MapPin } from 'lucide-react';

export default function NotificationToast() {
  const { alerts, dismissAlert, isHydrated } = useHydratedNotificationStore();
  
  const [visibleAlerts, setVisibleAlerts] = useState<string[]>([]);
  
  // Show new alerts for a limited time
  useEffect(() => {
    if (!isHydrated) return;
    
    const newAlerts = alerts
      .filter(alert => !alert.dismissed)
      .slice(0, 3) // Show max 3 toasts at once
      .map(alert => alert.id);
    
    setVisibleAlerts(newAlerts);
    
    // Auto-hide toasts after 5 seconds
    newAlerts.forEach(alertId => {
      setTimeout(() => {
        setVisibleAlerts(prev => prev.filter(id => id !== alertId));
      }, 5000);
    });
  }, [alerts, isHydrated]);
  
  // Don't render anything until hydrated
  if (!isHydrated) {
    return null;
  }
  
  const activeToasts = alerts.filter(alert => 
    !alert.dismissed && visibleAlerts.includes(alert.id)
  );
  
  if (activeToasts.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-20 right-4 z-[9997] space-y-2 pointer-events-none">
      {activeToasts.map((alert, index) => (
        <div
          key={alert.id}
          className="bg-red-500 text-white rounded-lg shadow-lg p-4 max-w-sm pointer-events-auto animate-fade-in"
          style={{ 
            animationDelay: `${index * 100}ms`,
            transform: `translateY(${index * 8}px)` 
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-red-600 rounded-full">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{alert.event.type}</p>
                <div className="flex items-center text-xs text-red-100 mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {alert.event.location.name}
                </div>
                <p className="text-xs text-red-200 mt-1">
                  {new Date(alert.event.datetime).toLocaleString('sv-SE')}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                dismissAlert(alert.id);
                setVisibleAlerts(prev => prev.filter(id => id !== alert.id));
              }}
              className="text-red-200 hover:text-white ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}