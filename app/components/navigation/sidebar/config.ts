/**
 * Sidebar Configuration
 * Single source of truth for sidebar-related settings
 */

export const SIDEBAR_CONFIG = {
  // Cache settings (in milliseconds) - Optimized for local data approach
  CACHE: {
    // How long data stays fresh - Extended caching for local data
    STALE_TIME: {
      COUNTRIES: 7 * 24 * 60 * 60 * 1000, // 7 days for countries (local data)
      COUNTRY_LEAGUES: 24 * 60 * 60 * 1000, // 24 hours for country leagues (as per requirements)
      TYPES: 20 * 24 * 60 * 60 * 1000, // 20 days for types (static data)
      STATES: 20 * 24 * 60 * 60 * 1000, // 20 days for states (static data)
    },
    
    // How long data stays in cache after becoming stale - Extended for local data
    GC_TIME: {
      COUNTRIES: 21 * 24 * 60 * 60 * 1000, // 21 days (local data, below Node timeout limit)
      COUNTRY_LEAGUES: 48 * 60 * 60 * 1000, // 48 hours
      TYPES: 21 * 24 * 60 * 60 * 1000, // 21 days (static data, below Node timeout limit)
      STATES: 21 * 24 * 60 * 60 * 1000, // 21 days (static data, below Node timeout limit)
    },
  },
  
  // Retry settings
  RETRY: {
    MAX_ATTEMPTS: 3,
  },
  
  // Search settings
  SEARCH: {
    MIN_LENGTH: 2,
    MAX_RECENT_SEARCHES: 10,
  },
} as const;

/**
 * Helper function to format dates for API calls
 * @param date - The date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Helper function to get current timestamp for cache invalidation
 * @returns ISO timestamp string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
