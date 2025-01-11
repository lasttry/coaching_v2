import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings } from '@/types/club/types';

// Update the settings using the bellow line
// const updateSettingsEvent = new Event('updateSettings');
// window.dispatchEvent(updateSettingsEvent);

interface SettingsContextProps {
  settings: Settings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data: Settings = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Listen for external updates
    const handleUpdateSettings = async () => {
      loadSettings(); // Reload settings
    };

    window.addEventListener('updateSettings', handleUpdateSettings);

    return () => {
      window.removeEventListener('updateSettings', handleUpdateSettings);
    };
  }, []);

  if (loading) {
    return <div>Loading settings...</div>; // Block rendering until settings are ready
  }

  return (
    <SettingsContext.Provider value={{ settings, loading: false }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
