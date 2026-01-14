'use client';

import { useState } from 'react';
import { useHydratedNotificationStore } from '@/hooks/useHydratedNotificationStore';
import { SWEDISH_REGIONS, REGION_DISPLAY_NAMES } from '@/utils/regions';
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Settings,
  MapPin,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export default function NotificationPanel() {
  const {
    rules,
    alerts,
    audioEnabled,
    isNotificationPanelOpen,
    addRule,
    removeRule,
    toggleRule,
    dismissAlert,
    clearAllAlerts,
    toggleAudio,
    setNotificationPanelOpen,
    isHydrated,
  } = useHydratedNotificationStore();

  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'region' as 'region' | 'city' | 'event_type',
    value: '',
    enabled: true,
  });

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const hasActiveAlerts = activeAlerts.length > 0;

  // Don't render until hydrated to avoid SSR mismatch
  if (!isHydrated) {
    return (
      <button
        className="fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
        title="Loading notifications..."
        disabled
      >
        <BellOff className="w-6 h-6" />
      </button>
    );
  }

  const handleAddRule = () => {
    console.log('handleAddRule called with:', newRule);
    if (newRule.name && newRule.value) {
      console.log('Adding rule:', newRule);
      addRule(newRule);
      setNewRule({ name: '', type: 'region', value: '', enabled: true });
      setShowAddRule(false);
      console.log('Rule added successfully');
    } else {
      console.log('Form validation failed - missing name or value');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <>
      {/* Notification Toggle Button */}
      <button
        onClick={() => setNotificationPanelOpen(!isNotificationPanelOpen)}
        className={`fixed top-4 right-4 z-[9999] p-3 rounded-full shadow-lg transition-all duration-300 ${
          hasActiveAlerts 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
        }`}
        title="Notifications"
      >
        {hasActiveAlerts ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
        {hasActiveAlerts && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeAlerts.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isNotificationPanelOpen && (
        <div className="fixed inset-0 z-[9998] flex justify-end">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setNotificationPanelOpen(false)}
          />
          <div className="w-96 bg-white shadow-xl h-full overflow-hidden flex flex-col z-[9999]">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Notifikationer</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-lg transition-colors ${
                      audioEnabled ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={audioEnabled ? 'Ljudnotifikationer på' : 'Ljudnotifikationer av'}
                  >
                    {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setNotificationPanelOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Active Alerts */}
              {activeAlerts.length > 0 && (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Aktiva varningar ({activeAlerts.length})</h3>
                    <button
                      onClick={clearAllAlerts}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Rensa alla
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {activeAlerts.map((alert) => (
                      <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">{alert.event.type}</p>
                            <p className="text-xs text-red-600 mt-1">{alert.event.location.name}</p>
                            <div className="flex items-center text-xs text-red-500 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(alert.timestamp).toLocaleTimeString('sv-SE')}
                            </div>
                          </div>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notification Rules */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Notifieringsregler</h3>
                  <button
                    onClick={() => setShowAddRule(true)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add Rule Form */}
                {showAddRule && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 border">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Regelnamn (t.ex. Gävleborg varningar)"
                        value={newRule.name}
                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      
                      <select
                        value={newRule.type}
                        onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any, value: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="region">Region (län)</option>
                        <option value="city">Stad/Ort</option>
                        <option value="event_type">Händelsetyp</option>
                      </select>

                      {newRule.type === 'region' ? (
                        <select
                          value={newRule.value}
                          onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="" className="text-gray-500">Välj region...</option>
                          {SWEDISH_REGIONS.map((region) => (
                            <option key={region} value={region} className="text-gray-900">
                              {REGION_DISPLAY_NAMES[region] || region}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder={
                            newRule.type === 'city' 
                              ? 'Stad/ort (t.ex. Hudiksvall)'
                              : 'Händelsetyp (t.ex. Trafikolycka)'
                          }
                          value={newRule.value}
                          onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowAddRule(false)}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Avbryt
                        </button>
                        <button
                          onClick={handleAddRule}
                          disabled={!newRule.name || !newRule.value}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          Lägg till
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rules List */}
                <div className="space-y-2">
                  {rules.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Inga notifieringsregler ännu. Lägg till en för att få varningar!
                    </p>
                  ) : (
                    rules.map((rule) => (
                      <div key={rule.id} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {rule.type === 'region' && <MapPin className="w-4 h-4 text-blue-500" />}
                              {rule.type === 'city' && <MapPin className="w-4 h-4 text-green-500" />}
                              {rule.type === 'event_type' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                              <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {rule.type === 'region' && `Region: ${REGION_DISPLAY_NAMES[rule.value] || rule.value}`}
                              {rule.type === 'city' && `Stad: ${rule.value}`}
                              {rule.type === 'event_type' && `Händelse: ${rule.value}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleRule(rule.id)}
                              className={`p-1.5 rounded transition-colors ${
                                rule.enabled 
                                  ? 'text-green-600 hover:bg-green-50' 
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              {rule.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => removeRule(rule.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notification Permission */}
              {'Notification' in window && Notification.permission === 'default' && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={requestNotificationPermission}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Aktivera webbläsarnotifikationer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}