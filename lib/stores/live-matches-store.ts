import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface LiveMatch {
  fixtureId: string;
  startTime: string;
  currentMinute: number;
  isLive: boolean;
  lastUpdated: number;
  status: 'live' | 'ht' | '2h' | 'ft' | 'cancelled' | 'postponed';
}

interface LiveMatchesState {
  matches: Map<string, LiveMatch>;
  timer: NodeJS.Timeout | null;
  isTimerRunning: boolean;
  
  // Actions
  addLiveMatch: (fixtureId: string, startTime: string, status?: string) => void;
  removeLiveMatch: (fixtureId: string) => void;
  updateMinutes: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  getCurrentMinute: (fixtureId: string) => number | null;
  getMatchStatus: (fixtureId: string) => LiveMatch['status'] | null;
  updateMatchStatus: (fixtureId: string, status: LiveMatch['status']) => void;
  clearAllMatches: () => void;
}

// Helper function to calculate minutes played
function calculateMinutesPlayed(startTime: string): number {
  try {
    const start = new Date(startTime + 'Z');
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
    
    // Return minutes if reasonable (0-200 minutes)
    if (diff >= 0 && diff <= 200) {
      return diff;
    }
    return 0;
  } catch (error) {
    console.error('Error calculating minutes played:', error);
    return 0;
  }
}

// Helper function to determine match status based on minutes
function determineMatchStatus(minutes: number): LiveMatch['status'] {
  if (minutes <= 0) return 'live';
  if (minutes >= 45 && minutes <= 60) return 'ht'; // Half time
  if (minutes >= 60 && minutes <= 105) return '2h'; // Second half
  if (minutes > 105) return 'ft'; // Full time
  return 'live';
}

export const useLiveMatchesStore = create<LiveMatchesState>()(
  devtools(
    (set, get) => ({
      matches: new Map(),
      timer: null,
      isTimerRunning: false,

      addLiveMatch: (fixtureId: string, startTime: string, status?: string) => {
        console.log('Adding live match:', { fixtureId, startTime, status });
        set((state) => {
          const newMatches = new Map(state.matches);
          const currentMinute = calculateMinutesPlayed(startTime);
          
          newMatches.set(fixtureId, {
            fixtureId,
            startTime,
            currentMinute,
            isLive: true,
            lastUpdated: Date.now(),
            status: (status as LiveMatch['status']) || determineMatchStatus(currentMinute),
          });

          console.log('Live match added:', { fixtureId, currentMinute, totalMatches: newMatches.size });

          // Check if we need to start the timer
          const shouldStartTimer = !state.isTimerRunning;

          return { 
            matches: newMatches,
            // Start timer immediately if not already running
            ...(shouldStartTimer && {
              isTimerRunning: true
            })
          };
        });

        // Handle timer start outside of set() to avoid infinite loops
        const state = get();
        if (!state.timer && state.matches.size > 0) {
          console.log('Starting timer for live matches');
          const timer = setInterval(() => {
            get().updateMinutes();
          }, 120000); // Update every 2 minutes (reduce frequency for performance)
          
          set({ timer });
        }
      },

      removeLiveMatch: (fixtureId: string) => {
        set((state) => {
          const newMatches = new Map(state.matches);
          newMatches.delete(fixtureId);

          // Check if we need to stop the timer
          const shouldStopTimer = newMatches.size === 0 && state.isTimerRunning;

          return { 
            matches: newMatches,
            // Stop timer immediately if no more matches
            ...(shouldStopTimer && {
              timer: null,
              isTimerRunning: false
            })
          };
        });

        // Handle timer cleanup outside of set() to avoid infinite loops
        const state = get();
        if (state.matches.size === 0 && state.timer) {
          clearInterval(state.timer);
        }
      },

      updateMinutes: () => {
        set((state) => {
          const newMatches = new Map();
          let hasLiveMatches = false;

          state.matches.forEach((match) => {
            const currentMinute = calculateMinutesPlayed(match.startTime);
            const status = determineMatchStatus(currentMinute);
            
            // Update match with new minute and status
            newMatches.set(match.fixtureId, {
              ...match,
              currentMinute,
              status,
              lastUpdated: Date.now(),
              isLive: status === 'live' || status === 'ht' || status === '2h',
            });

            if (status === 'live' || status === 'ht' || status === '2h') {
              hasLiveMatches = true;
            }
          });

          // Check if we need to stop the timer
          const shouldStopTimer = !hasLiveMatches && state.isTimerRunning;

          return { 
            matches: newMatches,
            // Stop timer immediately if no more live matches
            ...(shouldStopTimer && {
              timer: null,
              isTimerRunning: false
            })
          };
        });

        // Handle timer cleanup outside of set() to avoid infinite loops
        const state = get();
        if (!state.isTimerRunning && state.timer) {
          clearInterval(state.timer);
        }
      },

      startTimer: () => {
        const state = get();
        if (state.isTimerRunning) return;

        const timer = setInterval(() => {
          get().updateMinutes();
        }, 120000); // Update every 2 minutes (reduce frequency for performance)

        set({ timer, isTimerRunning: true });
      },

      stopTimer: () => {
        const state = get();
        if (state.timer) {
          clearInterval(state.timer);
        }
        set({ timer: null, isTimerRunning: false });
      },

      getCurrentMinute: (fixtureId: string) => {
        const state = get();
        const match = state.matches.get(fixtureId);
        return match ? match.currentMinute : null;
      },

      getMatchStatus: (fixtureId: string) => {
        const state = get();
        const match = state.matches.get(fixtureId);
        return match ? match.status : null;
      },

      updateMatchStatus: (fixtureId: string, status: LiveMatch['status']) => {
        set((state) => {
          const newMatches = new Map(state.matches);
          const match = newMatches.get(fixtureId);
          
          if (match) {
            newMatches.set(fixtureId, {
              ...match,
              status,
              lastUpdated: Date.now(),
            });
          }

          return { matches: newMatches };
        });
      },

      clearAllMatches: () => {
        const state = get();
        if (state.timer) {
          clearInterval(state.timer);
        }
        set({ matches: new Map(), timer: null, isTimerRunning: false });
      },
    }),
    {
      name: 'live-matches-store',
    }
  )
);
