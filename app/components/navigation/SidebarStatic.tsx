'use client';

import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Settings, RefreshCw, Calendar, Eye, Download, Star, ArrowUpDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SidebarTheme } from './SidebarTheme';
import { Logo } from '@/components/ui/Logo';

// Import modular components
import { SearchResults } from './sidebar/SearchResults';
import { CountriesSection } from './sidebar/CountriesSection';
import { TopLeaguesSection } from './sidebar/TopLeaguesSection';
import { TournamentsSection } from './sidebar/TournamentsSection';

// Import custom hooks
import { useFavorites } from './sidebar/hooks/useFavorites';
import { useSidebarData } from './sidebar/hooks/useSidebarData';
import { useLeagueFixtures } from './sidebar/hooks/useLeagueFixtures';
import { useRecentSearches } from './sidebar/hooks/useRecentSearches';
import { useKeyboardShortcuts } from './sidebar/hooks/useKeyboardShortcuts';
import { useSorting } from './sidebar/hooks/useSorting';

// Import types
import type { CountryWithLeagues, TopLeague } from './sidebar/types';

interface SidebarStaticProps {
  showLogo?: boolean;
}

export const SidebarStatic = memo(function SidebarStatic({ showLogo = false }: SidebarStaticProps = {}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  
  // Filter states
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Recent searches
  const { recentSearches, addToRecentSearches, clearRecentSearches } = useRecentSearches();
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    searchInputRef,
    onToggleFavorites: () => setShowFavoritesOnly(prev => !prev),
    onToggleActive: () => setShowActiveOnly(prev => !prev),
    onToggleToday: () => setShowTodayOnly(prev => !prev),
    onRefresh: () => setRefreshTrigger(prev => prev + 1),
  });
  
  if (isHomePage) {
    return null;
  }

  return (
    <SidebarTheme>
      <div className="flex flex-col h-full bg-gradient-to-b from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/90 backdrop-blur-sm">
        {/* Logo Header - Only show on mobile or when explicitly requested */}
        {showLogo && (
          <div className="p-3 border-b border-sidebar-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
            <Logo size="sm" showText={true} />
          </div>
        )}
        
        {/* Header with Search */}
        <div className="p-2 border-b bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search countries, leagues... (Ctrl+K)"
              className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:bg-white/90 dark:hover:bg-gray-800/90 shadow-sm hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowRecentSearches(true)}
              onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  addToRecentSearches(searchTerm);
                  setShowRecentSearches(false);
                }
              }}
            />
            
            {/* Recent Searches Dropdown */}
            {showRecentSearches && recentSearches.length > 0 && !searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recent Searches</div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors hover:scale-105 active:scale-95"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={`${search}-${index}`}
                        className="w-full text-left px-3 py-2 text-xs rounded-md hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] hover:shadow-sm"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur
                          setSearchTerm(search);
                          setShowRecentSearches(false);
                        }}
                      >
                        <Search className="inline h-3 w-3 mr-2 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Search Results Dropdown */}
            <SearchResults searchTerm={searchTerm} />
          </div>
          
          {/* Utility Tools Row */}
          <div className="flex items-center justify-between gap-1 mb-2">
            {/* Left side - Filter tools */}
            <div className="flex items-center gap-1">
              <button
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                  showFavoritesOnly 
                    ? 'text-yellow-700 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-700/50'
                    : 'text-muted-foreground hover:text-foreground bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50'
                }`}
                title="Show only favorites (Ctrl+F)"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Star className={`h-3 w-3 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">Fav</span>
              </button>
              
              <button
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                  showActiveOnly 
                    ? 'text-green-700 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-300 border border-green-200/50 dark:border-green-700/50'
                    : 'text-muted-foreground hover:text-foreground bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50'
                }`}
                title="Show only active leagues (Ctrl+A)"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
              >
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">Active</span>
              </button>
              
              <button
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                  showTodayOnly 
                    ? 'text-blue-700 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50'
                    : 'text-muted-foreground hover:text-foreground bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50'
                }`}
                title="Show leagues with upcoming fixtures (Ctrl+T)"
                onClick={() => setShowTodayOnly(!showTodayOnly)}
              >
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">Upcoming</span>
              </button>
            </div>
            
            {/* Right side - Action tools */}
            <div className="flex items-center gap-1">
              <button
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-muted-foreground hover:text-foreground ${
                  isRefreshing ? 'cursor-wait' : ''
                }`}
                title="Refresh data (Ctrl+R)"
                disabled={isRefreshing}
                onClick={() => {
                  setRefreshTrigger((prev) => prev + 1);
                }}
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Loading...' : ''}</span>
              </button>
              
              <button
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-muted-foreground hover:text-foreground"
                title="Export favorites"
                onClick={() => {
                  // Export favorites to JSON
                  const favorites = localStorage.getItem('sidebar-favorites');
                  if (favorites) {
                    const blob = new Blob([favorites], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'favorites.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
              >
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <button
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-muted-foreground hover:text-foreground"
                title="Keyboard shortcuts: Ctrl+K (Search), Ctrl+F (Favorites), Ctrl+A (Active), Ctrl+T (Today), Ctrl+R (Refresh)"
                onClick={() => {
                  // Show keyboard shortcuts help
                  alert('Keyboard Shortcuts:\n\nCtrl+K or Cmd+K: Focus search\nCtrl+F or Cmd+F: Toggle favorites\nCtrl+A or Cmd+A: Toggle active filter\nCtrl+T or Cmd+T: Toggle today filter\nCtrl+R or Cmd+R: Refresh data\nEsc: Clear search and unfocus');
                }}
              >
                <Settings className="h-3 w-3" />
                <span className="hidden sm:inline">Help</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area - This will stream in */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full">
          <SidebarContent 
            searchTerm={searchTerm} 
            showFavoritesOnly={showFavoritesOnly}
            showActiveOnly={showActiveOnly}
            showTodayOnly={showTodayOnly}
            refreshTrigger={refreshTrigger}
            onRefreshStateChange={setIsRefreshing}
          />
        </div>
      </div>
    </SidebarTheme>
  );
});

// Dynamic content that loads the actual sidebar data with full functionality
function SidebarContent({ 
  searchTerm, 
  showFavoritesOnly, 
  showActiveOnly, 
  showTodayOnly,
  refreshTrigger,
  onRefreshStateChange,
}: { 
  searchTerm: string;
  showFavoritesOnly: boolean;
  showActiveOnly: boolean;
  showTodayOnly: boolean;
  refreshTrigger: number;
  onRefreshStateChange: (isRefreshing: boolean) => void;
}) {
  // Use custom hooks
  const { favorites, toggleFavorite } = useFavorites();
  const { allCountries, countryLeagues, loadingStates, loadCountriesWithLeagues, loadCountryLeagues, clearCache: clearDataCache } = useSidebarData();
  const { leagueFixtureCounts, loadingLeagueCounts, loadLeagueFixtureCounts, clearCache: clearFixturesCache } = useLeagueFixtures();
  const { sortBy, setSortBy, sortCountries } = useSorting();

  // Local state
  const [filteredCountries, setFilteredCountries] = useState<CountryWithLeagues[]>([]);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [countryTodayCounts, setCountryTodayCounts] = useState<Map<number, number>>(new Map());
  const [loadingCounts, setLoadingCounts] = useState<Set<number>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isLoading] = useState(false);

  // Top leagues data - memoized to prevent dependency issues
  const topLeagues: TopLeague[] = React.useMemo(() => [
    { id: 8, name: 'Premier League', country: 'England', short_code: 'EPL', countryId: 462 },
    { id: 564, name: 'La Liga', country: 'Spain', short_code: 'LL', countryId: 32 },
    { id: 384, name: 'Serie A', country: 'Italy', short_code: 'SA', countryId: 251 },
    { id: 351, name: 'Bundesliga', country: 'Germany', short_code: 'BL', countryId: 11 },
    { id: 301, name: 'Ligue 1', country: 'France', short_code: 'L1', countryId: 17 },
    { id: 7, name: 'Championship', country: 'England', short_code: 'CH', countryId: 462 },
    { id: 72, name: 'Eredivisie', country: 'Netherlands', short_code: 'ED', countryId: 38 },
    { id: 238, name: 'Primeira Liga', country: 'Portugal', short_code: 'PL', countryId: 20 },
  ], []);
  
  // Toggle section collapse
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Toggle country expansion
  const toggleCountry = useCallback(
    (countryId: number) => {
      setExpandedCountries((prev) => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(countryId)) {
          newExpanded.delete(countryId);
        } else {
          newExpanded.add(countryId);
          // Load leagues when expanding
          loadCountryLeagues(countryId).then((leagues) => {
            // Load fixture counts for the leagues
            leagues.forEach((league: { id: number }) => {
              loadLeagueFixtureCounts(league.id);
            });
          });
        }
        return newExpanded;
      });
    },
    [loadCountryLeagues, loadLeagueFixtureCounts]
  );

  // Load upcoming fixture counts for a country (next 7 days)
  const loadTodayFixtureCounts = useCallback(
    async (countryId: number) => {
      setLoadingCounts((prev) => {
        if (prev.has(countryId)) {
          return prev; // Already loading
        }
        return new Set(prev).add(countryId);
      });

      try {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const startDate = today.toISOString().split('T')[0];
        const endDate = nextWeek.toISOString().split('T')[0];
        
        console.log(`Loading fixture count for country ${countryId} from ${startDate} to ${endDate}`);
        const response = await fetch(`/api/sportmonks/fixtures/country-date-range?startDate=${startDate}&endDate=${endDate}&countryId=${countryId}`);
        const data = await response.json();

        console.log(`Fixture count response for country ${countryId}:`, data);

        if (data.success && data.count !== undefined) {
          console.log(`Setting fixture count for country ${countryId}: ${data.count}`);
          setCountryTodayCounts((prev) => new Map(prev).set(countryId, data.count));
        } else {
          console.log(`No fixtures found for country ${countryId}, setting count to 0`);
          setCountryTodayCounts((prev) => new Map(prev).set(countryId, 0));
        }
      } catch (error) {
        console.error('Error loading fixture counts for country:', countryId, error);
        setCountryTodayCounts((prev) => new Map(prev).set(countryId, 0));
      } finally {
        setLoadingCounts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(countryId);
      return newSet;
    });
      }
    },
    []
  );

  // Tournament detection logic
  const KNOWN_TOURNAMENTS = React.useMemo(
    () =>
      new Set([
        41, // Europe
        147, // Africa
    11240938, // Asia (AFC)
      ]),
    []
  );

  const isTournament = useCallback(
    (country: CountryWithLeagues) => {
    if (KNOWN_TOURNAMENTS.has(country.id)) return true;
    
    const name = (country.name || country.fifa_name || country.official_name || '').trim().toLowerCase();
    if (!name) return false;
    
      const continents = new Set(['africa', 'europe', 'asia', 'north america', 'south america', 'oceania', 'antarctica', 'world', 'international']);
    if (continents.has(name)) return true;
    
    const orgs = ['uefa', 'caf', 'afc', 'conmebol', 'concacaf', 'ofc', 'fifa'];
    const code = (country.fifa_name || country.official_name || '').trim().toLowerCase();
      if (orgs.some((org) => name.includes(org) || code.includes(org))) return true;
    
    if (name.includes('continental') || name.includes('regional') || name.includes('intercontinental')) return true;
    
    const tournamentKeywords = [
        'champions league',
        'europa league',
        'europa conference league',
        'conference league',
        'african cup',
        'asian cup',
        'copa america',
        'gold cup',
        'oceanian cup',
        'nations league',
        'confederations cup',
        'club world cup',
        'super cup',
        'world cup',
        'euro',
        'copa libertadores',
        'copa sudamericana',
      ];

      if (tournamentKeywords.some((keyword) => name.includes(keyword))) return true;
    
    return false;
    },
    [KNOWN_TOURNAMENTS]
  );

  // Split filtered list into countries and tournaments
  const { countryItems, tournamentItems } = React.useMemo(() => {
    const countries: CountryWithLeagues[] = [];
    const tournaments: CountryWithLeagues[] = [];
    
    for (const c of filteredCountries) {
      if (isTournament(c)) {
        tournaments.push(c);
      } else {
        countries.push(c);
      }
    }
    return { countryItems: countries, tournamentItems: tournaments };
  }, [filteredCountries, isTournament]);

  // Load countries on mount
  useEffect(() => {
    loadCountriesWithLeagues();
  }, [loadCountriesWithLeagues]);

  // Load fixture counts for top leagues on mount
  useEffect(() => {
    topLeagues.forEach((league) => {
      loadLeagueFixtureCounts(league.id);
    });
  }, [topLeagues, loadLeagueFixtureCounts]);

  // Handle refresh trigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      const performRefresh = async () => {
        onRefreshStateChange(true);
        try {
            // Clear all caches first
            clearDataCache();
            clearFixturesCache();
            setCountryTodayCounts(new Map());
            setExpandedCountries(new Set());
            processedCountriesRef.current.clear();

          // Wait a tick for state updates to propagate
          await new Promise(resolve => setTimeout(resolve, 0));

          // Reload countries
          await loadCountriesWithLeagues();

          // Reload top leagues fixture counts (force refresh)
          for (const league of topLeagues) {
            await loadLeagueFixtureCounts(league.id, true);
          }
    } finally {
          onRefreshStateChange(false);
        }
      };

      performRefresh();
    }
  }, [refreshTrigger, onRefreshStateChange, topLeagues, clearDataCache, clearFixturesCache, loadCountriesWithLeagues, loadLeagueFixtureCounts]);

  // Ref to track processed countries to avoid infinite loops
  const processedCountriesRef = useRef(new Set<number>());

  // Load fixture counts for visible countries
  useEffect(() => {
    const visibleCountries = filteredCountries.slice(0, 20);
    console.log(`Processing ${visibleCountries.length} visible countries for fixture counts`);
    
    visibleCountries.forEach((country) => {
      const isProcessed = processedCountriesRef.current.has(country.id);
      const hasCount = countryTodayCounts.has(country.id);
      const isLoading = loadingCounts.has(country.id);
      
      console.log(`Country ${country.id} (${country.name}): processed=${isProcessed}, hasCount=${hasCount}, isLoading=${isLoading}, leaguesCount=${country.leaguesCount}`);
      
      if (country.leaguesCount > 0 && 
          !isProcessed &&
          !hasCount && 
          !isLoading) {
        console.log(`Loading fixture count for country ${country.id}`);
        processedCountriesRef.current.add(country.id);
        loadTodayFixtureCounts(country.id);
      }
    });
  }, [filteredCountries, loadTodayFixtureCounts]); // Stable dependencies only

  // Filter and sort countries based on search term, filter options, and sort preference
  useEffect(() => {
    let filtered = allCountries;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((country) => {
        const name = (country.name || country.fifa_name || country.official_name || '').toLowerCase();
        return name.includes(searchLower);
      });
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter((country) => favorites.has(country.id));
    }

    // Apply active leagues filter
    if (showActiveOnly) {
      filtered = filtered.filter((country) => (country.leaguesCount || 0) > 0);
    }

    // Apply today's fixtures filter
    if (showTodayOnly) {
      filtered = filtered.filter((country) => (countryTodayCounts.get(country.id) || 0) > 0);
    }
    
    // Apply sorting
    const sorted = sortCountries(filtered, countryTodayCounts, favorites);

    setFilteredCountries(sorted);
  }, [searchTerm, allCountries, showFavoritesOnly, showActiveOnly, showTodayOnly, favorites, countryTodayCounts, sortBy, sortCountries]);

  // Show skeleton while data is loading
  if (isLoading || allCountries.length === 0) {
    return <SidebarContentSkeleton />;
  }

  return (
    <div className="p-1">
      {/* Sorting Controls */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200/50 dark:border-gray-700/50">
          <ArrowUpDown className="h-3 w-3 text-gray-600 dark:text-gray-400" />
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
          <div className="flex gap-1">
        <button
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                sortBy === 'name'
                  ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:shadow-sm'
              }`}
              title="Sort alphabetically by name"
            >
              Name
        </button>
                  <button
              onClick={() => setSortBy('fixtures')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                sortBy === 'fixtures'
                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-300 border border-green-200/50 dark:border-green-700/50 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:shadow-sm'
              }`}
              title="Sort by fixture count (most first)"
            >
              Fixtures
                  </button>
                    <button
              onClick={() => setSortBy('favorites')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                sortBy === 'favorites'
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 dark:from-yellow-900/40 dark:to-yellow-800/40 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-700/50 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:shadow-sm'
              }`}
              title="Show favorites first"
            >
              Favorites
                    </button>
                  </div>
                </div>
      </div>
      
      {/* 1. Countries Section */}
      <CountriesSection
        countries={countryItems}
        isCollapsed={collapsedSections.has('countries')}
        onToggle={() => toggleSection('countries')}
        expandedCountries={expandedCountries}
        onToggleCountry={toggleCountry}
        countryLeagues={countryLeagues}
        loadingStates={loadingStates}
        countryTodayCounts={countryTodayCounts}
        loadingCounts={loadingCounts}
        leagueFixtureCounts={leagueFixtureCounts}
        loadingLeagueCounts={loadingLeagueCounts}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      {/* 2. Top Leagues Section */}
      <TopLeaguesSection
        isCollapsed={collapsedSections.has('top-leagues')}
        onToggle={() => toggleSection('top-leagues')}
        leagueFixtureCounts={leagueFixtureCounts}
        loadingLeagueCounts={loadingLeagueCounts}
      />

      {/* 3. Tournaments Section */}
      <TournamentsSection
        tournaments={tournamentItems}
        isCollapsed={collapsedSections.has('tournaments')}
        onToggle={() => toggleSection('tournaments')}
        expandedCountries={expandedCountries}
        onToggleCountry={toggleCountry}
        countryLeagues={countryLeagues}
        loadingStates={loadingStates}
        countryTodayCounts={countryTodayCounts}
        loadingCounts={loadingCounts}
        leagueFixtureCounts={leagueFixtureCounts}
        loadingLeagueCounts={loadingLeagueCounts}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}

// Skeleton for the dynamic content area
function SidebarContentSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {/* Countries skeleton */}
      <div className="space-y-2">
        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      {/* Leagues skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-50 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-50 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-50 dark:bg-gray-600 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

