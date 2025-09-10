'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface DisplaySettings {
  showTeamImages: boolean;
  showValueBetExplanations: boolean;
}

interface DisplaySettingsContextType {
  settings: DisplaySettings;
  updateSettings: (newSettings: Partial<DisplaySettings>) => void;
  toggleTeamImages: () => void;
  toggleValueBetExplanations: () => void;
}

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(undefined);

const defaultSettings: DisplaySettings = {
  showTeamImages: true,
  showValueBetExplanations: true,
};

export function DisplaySettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<DisplaySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleTeamImages = () => {
    setSettings(prev => ({ ...prev, showTeamImages: !prev.showTeamImages }));
  };

  const toggleValueBetExplanations = () => {
    setSettings(prev => ({ ...prev, showValueBetExplanations: !prev.showValueBetExplanations }));
  };

  return (
    <DisplaySettingsContext.Provider value={{ settings, updateSettings, toggleTeamImages, toggleValueBetExplanations }}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}

export function useDisplaySettings() {
  const context = useContext(DisplaySettingsContext);
  if (context === undefined) {
    throw new Error('useDisplaySettings must be used within a DisplaySettingsProvider');
  }
  return context;
}
