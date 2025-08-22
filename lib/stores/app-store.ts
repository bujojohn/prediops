import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  selectedLeague: number | null;
  selectedSeason: number | null;
  
  // User Preferences
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  notifications: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSelectedLeague: (leagueId: number | null) => void;
  setSelectedSeason: (seasonId: number | null) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  setNotifications: (enabled: boolean) => void;
  
  // Reset
  resetPreferences: () => void;
}

const initialState = {
  sidebarOpen: false,
  theme: 'system' as const,
  selectedLeague: null,
  selectedSeason: null,
  autoRefresh: true,
  refreshInterval: 30,
  notifications: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setTheme: (theme) => set({ theme }),
      
      setSelectedLeague: (leagueId) => set({ selectedLeague: leagueId }),
      
      setSelectedSeason: (seasonId) => set({ selectedSeason: seasonId }),
      
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
      
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
      
      setNotifications: (enabled) => set({ notifications: enabled }),
      
      resetPreferences: () => set(initialState),
    }),
    {
      name: 'prediops-app-store',
      partialize: (state) => ({
        theme: state.theme,
        selectedLeague: state.selectedLeague,
        selectedSeason: state.selectedSeason,
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
        notifications: state.notifications,
      }),
    }
  )
); 