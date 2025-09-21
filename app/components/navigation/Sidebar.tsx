'use client';

import React, { useState, useEffect, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Globe, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink,
  Info,
  Star,
  StarOff,
  SortAsc,
  SortDesc,
  RefreshCw,
  Settings
} from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SidebarTheme } from './SidebarTheme';
import { getCountryPredictionsUrl, generateLeagueSlug } from '@/lib/utils/country-utils';
import type { Country } from '@/schemas/country.schema';

interface CountryWithLeagues extends Country {
  fixtureCount: number;
  leaguesCount: number;
}

interface League {
  id: number;
  name: string;
  active: boolean;
  type?: string;
  short_code?: string;
}

const Sidebar = memo(function Sidebar() {
  const [allCountries, setAllCountries] = useState<CountryWithLeagues[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryWithLeagues[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [countryLeagues, setCountryLeagues] = useState<Map<number, League[]>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<number, boolean>>(new Map());
  const [isLoading] = useState(false); // Start with false to show skeleton immediately
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Keep a ref in sync with countryLeagues to allow a stable callback without depending on state
  const countryLeaguesRef = React.useRef(countryLeagues);
  useEffect(() => {
    countryLeaguesRef.current = countryLeagues;
  }, [countryLeagues]);
  
  // Favorites and filtering state
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'fixtures' | 'leagues'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Today fixture counts
  const [countryTodayCounts, setCountryTodayCounts] = useState<Map<number, number>>(new Map());
  const [leagueTodayCounts, setLeagueTodayCounts] = useState<Map<number, number>>(new Map());
  const [countsLoadingCountries, setCountsLoadingCountries] = useState<Set<number>>(new Set());
  const today = React.useMemo(() => new Date().toISOString().split('T')[0], []);
  const storageKey = React.useMemo(() => `sidebar-counts-7days-${today}`, [today]);
  const [visibleLeagueBadges, setVisibleLeagueBadges] = useState<Set<number>>(new Set());
  // Regions (continents, world) handling - show by default for better UX
  const [hideRegions, setHideRegions] = useState(false);

  const isRegion = React.useCallback((country: CountryWithLeagues) => {
    const name = (country.name || country.fifa_name || country.official_name || '').trim().toLowerCase();
    if (!name) return false;
    
    // Continental/regional organizations and tournaments (not real countries)
    const regions = new Set([
      'africa', 'europe', 'asia', 'north america', 'south america', 'oceania', 'antarctica', 'world', 'international'
    ]);
    if (regions.has(name)) return true;
    
    // Continental football organizations
    const orgs = ['uefa', 'caf', 'afc', 'conmebol', 'concacaf', 'ofc', 'fifa'];
    
    // Major continental tournaments
    const tournaments = [
      'champions league', 'europa league', 'europa conference league', 'conference league',
      'african cup', 'asian cup', 'copa america', 'gold cup', 'oceanian cup',
      'nations league', 'confederations cup', 'club world cup', 'super cup',
      'world cup', 'euro', 'copa libertadores', 'copa sudamericana', 'libertadores',
      'sudamericana', 'champions', 'europa', 'conference'
    ];
    
    // Check in name
    if (orgs.some(org => name.includes(org))) return true;
    if (tournaments.some(tournament => name.includes(tournament))) return true;
    
    // Check in codes
    const code = (country.fifa_name || country.official_name || '').trim().toLowerCase();
    if (orgs.some(org => code.includes(org))) return true;
    
    // Additional checks for common continental tournament patterns
    if (name.includes('continental') || name.includes('regional') || name.includes('intercontinental')) return true;
    
    // Check for tournament-specific keywords
    if (name.includes('league') || name.includes('cup') || name.includes('championship')) {
      // But exclude country-specific leagues (e.g., "England League" vs "Champions League")
      if (name.includes('champions') || name.includes('europa') || name.includes('conference')) return true;
    }
    
    // Check for specific patterns that indicate continental/regional entities
    if (name.includes('continental') || name.includes('regional') || name.includes('intercontinental')) return true;
    
    // Check if it's a known continental entity by ID or other indicators
    // Some continental entities have specific patterns in their data
    // Note: country.type is not available in CountryWithLeagues interface
    
    return false;
  }, []);

  // Split filtered list into countries and regions
  const { countryItems, regionItems } = React.useMemo(() => {
    const countries: CountryWithLeagues[] = [];
    const regions: CountryWithLeagues[] = [];
    
    for (const c of filteredCountries) {
      if (isRegion(c)) {
        regions.push(c);
      } else {
        countries.push(c);
      }
    }
    return { countryItems: countries, regionItems: regions };
  }, [filteredCountries, isRegion]);

  // Debounced search input
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 200);
    return () => clearTimeout(t);
  }, [searchTerm]);
  
  // Restore persisted counts for today on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { countries?: [number, number][], leagues?: [number, number][] };
        if (parsed?.countries?.length) {
          const map = new Map<number, number>(parsed.countries);
          setCountryTodayCounts(map);
        }
        if (parsed?.leagues?.length) {
          const lmap = new Map<number, number>(parsed.leagues);
          setLeagueTodayCounts(lmap);
          setVisibleLeagueBadges(new Set(Array.from(lmap.keys())));
        }
      }
    } catch (e) {
      console.warn('Failed to restore sidebar counts from storage', e);
    }
  }, [storageKey]);
  
  // Load countries with leagues using API route
    const loadCountriesWithLeagues = async () => {
      try {
      // Don't set loading to true initially to avoid blocking render
      const response = await fetch('/api/sportmonks/countries/with-leagues');
      const data = await response.json();
      
      if (data.success) {
        const countries = data.data || [];
        console.log('Loaded countries data:', {
          count: countries.length,
          sample: countries.slice(0, 3).map((c: CountryWithLeagues) => ({
            id: c.id,
            name: c.name,
            leaguesCount: c.leaguesCount,
            fixtureCount: c.fixtureCount
          }))
        });
          setAllCountries(countries);
          setFilteredCountries(countries);
        console.log(`Loaded ${countries.length} countries with leagues`);
      } else {
        console.error('Failed to load countries:', data.error);
        setAllCountries([]);
        setFilteredCountries([]);
        }
      } catch (error) {
        console.error('Error loading countries with leagues:', error);
          setAllCountries([]);
          setFilteredCountries([]);
    }
    // No need to set loading false since we start with false
  };

  // Load leagues for a specific country using API route
  const loadCountryLeagues = React.useCallback(async (countryId: number) => {
    if (countryLeaguesRef.current.has(countryId)) {
      return; // Already loaded
    }

    setLoadingStates(prev => new Map(prev).set(countryId, true));
    
    try {
      const response = await fetch(`/api/sportmonks/leagues/country/${countryId}`);
      const data = await response.json();
      
      if (data.success) {
        const leagues = data.data || [];
        setCountryLeagues(prev => {
          const next = new Map(prev).set(countryId, leagues);
          countryLeaguesRef.current = next;
          return next;
        });
      } else {
        setCountryLeagues(prev => {
          const next = new Map(prev).set(countryId, []);
          countryLeaguesRef.current = next;
          return next;
        });
      }
    } catch (error) {
      console.error(`Error loading leagues for country ${countryId}:`, error);
      setCountryLeagues(prev => {
        const next = new Map(prev).set(countryId, []);
        countryLeaguesRef.current = next;
        return next;
      });
    } finally {
      setLoadingStates(prev => new Map(prev).set(countryId, false));
    }
  }, []);

  // Fetch fixtures for the next 7 days for a country and compute per-league counts
  const fetchCountryTodayCounts = React.useCallback(async (countryId: number) => {
    if (countryTodayCounts.has(countryId)) return;
    try {
      setCountsLoadingCountries(prev => new Set(prev).add(countryId));
      
      // Fetch fixtures for the next 7 days instead of just today
      const allFixtures = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        try {
          const url = `/api/sportmonks/fixtures/date-country?date=${dateStr}&countryId=${countryId}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data?.success && data.data) {
            allFixtures.push(...data.data);
          }
        } catch (err) {
          console.warn(`Failed to fetch fixtures for ${dateStr}:`, err);
        }
      }
      
      // Build next maps and persist
      const nextCountryMap = new Map(countryTodayCounts);
      nextCountryMap.set(countryId, allFixtures.length);

      const perLeague = new Map<number, number>();
      for (const f of allFixtures) {
        const lid = f?.league?.id;
        if (typeof lid === 'number') {
          perLeague.set(lid, (perLeague.get(lid) || 0) + 1);
        }
      }
      const nextLeagueMap = new Map(leagueTodayCounts);
      perLeague.forEach((cnt, lid) => nextLeagueMap.set(lid, cnt));

      setCountryTodayCounts(nextCountryMap);
      setLeagueTodayCounts(nextLeagueMap);

      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            countries: Array.from(nextCountryMap.entries()),
            leagues: Array.from(nextLeagueMap.entries()),
          })
        );
      } catch {}

      // Show league badges after counts are set
      if (perLeague.size > 0) {
        setVisibleLeagueBadges(prev => {
          const next = new Set(prev);
          perLeague.forEach((_, lid) => next.add(lid));
          return next;
        });
      }
    } catch (e) {
      // Non-fatal: leave counts absent
      console.error('Failed fetching today\'s fixtures for country', countryId, e);
    } finally {
      setCountsLoadingCountries(prev => {
        const next = new Set(prev);
        next.delete(countryId);
        return next;
      });
    }
  }, [countryTodayCounts, leagueTodayCounts, storageKey]);

  // Toggle country expansion with accordion behavior (only one country expanded at a time)
  const toggleCountry = (countryId: number) => {
    const newExpanded = new Set<number>();
    
    if (expandedCountries.has(countryId)) {
      // collapse
      // Don't add anything to newExpanded (empty set)
      try { localStorage.removeItem('sidebar-expanded-country'); } catch {}
    } else {
      // expand selected and collapse others
      newExpanded.add(countryId);
      // Load leagues when expanding
      loadCountryLeagues(countryId);
      // Load today's counts
      fetchCountryTodayCounts(countryId);
      // Persist expanded country
      try { localStorage.setItem('sidebar-expanded-country', String(countryId)); } catch {}
      // Smooth scroll into view
      setTimeout(() => {
        const el = document.getElementById(`country-${countryId}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 0);
    }
    
    setExpandedCountries(newExpanded);
  };

  // Get sort function based on current sort settings
  const getSortFunction = React.useCallback((a: CountryWithLeagues, b: CountryWithLeagues) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        const nameA = (a.name || a.fifa_name || a.official_name || '').toLowerCase();
        const nameB = (b.name || b.fifa_name || b.official_name || '').toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
      case 'fixtures':
        comparison = (a.fixtureCount || 0) - (b.fixtureCount || 0);
        break;
      case 'leagues':
        comparison = (a.leaguesCount || 0) - (b.leaguesCount || 0);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  }, [sortBy, sortOrder]);

  // Filter and sort countries based on search term, favorites, and sort settings
  useEffect(() => {
    let filtered = allCountries;
    
    console.log('Filtering countries:', {
      total: allCountries.length,
      searchTerm: debouncedSearch,
      showOnlyFavorites,
      favoritesSize: favorites.size
    });
    
    // Filter by search term
    if (debouncedSearch.trim()) {
      filtered = filtered.filter(country => 
        country.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        country.fifa_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        country.official_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    
    // Filter by favorites if enabled
    if (showOnlyFavorites) {
      filtered = filtered.filter(country => favorites.has(country.id));
    }
    
    // Optionally hide regions
    if (hideRegions) {
      filtered = filtered.filter(country => !isRegion(country));
    }

    
    console.log('After filtering:', {
      filtered: filtered.length,
      available: filtered.filter(c => (c.leaguesCount || 0) > 0).length,
      unavailable: filtered.filter(c => (c.leaguesCount || 0) === 0).length
    });
    
    // Sort countries based on current sort settings
    const sortedCountries = filtered.sort(getSortFunction);
    
    setFilteredCountries(sortedCountries);
  }, [debouncedSearch, allCountries, showOnlyFavorites, favorites, sortBy, sortOrder, getSortFunction, hideRegions, isRegion]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('sidebar-favorites');
      if (savedFavorites) {
        const favoritesArray = JSON.parse(savedFavorites);
        setFavorites(new Set(favoritesArray));
      }
      // Restore expanded country if present
      const savedExpanded = localStorage.getItem('sidebar-expanded-country');
      if (savedExpanded) {
        const id = Number(savedExpanded);
        if (!Number.isNaN(id)) {
          setExpandedCountries(new Set([id]));
          // Preload leagues
          loadCountryLeagues(id);
          fetchCountryTodayCounts(id);
          // Scroll into view after render
          setTimeout(() => {
            const el = document.getElementById(`country-${id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 0);
        }
      }
    } catch (error) {
      console.error('Error loading favorites/expanded from localStorage:', error);
    }
  }, [loadCountryLeagues, fetchCountryTodayCounts]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-favorites', JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = (countryId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering country expansion
    setFavorites(prev => {
      const newFavorites = new Set(prev);
    if (newFavorites.has(countryId)) {
      newFavorites.delete(countryId);
    } else {
      newFavorites.add(countryId);
    }
      return newFavorites;
    });
  };

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    // Clear cached leagues
    setCountryLeagues(new Map());
    // Optionally keep expanded state, but clear counts cache for today
    try { localStorage.removeItem(storageKey); } catch {}
    setCountryTodayCounts(new Map());
    setLeagueTodayCounts(new Map());
    setVisibleLeagueBadges(new Set());
    await loadCountriesWithLeagues();
    // If a country is expanded, refetch counts for it
    const expanded = Array.from(expandedCountries.values());
    if (expanded.length > 0) {
      for (const cid of expanded) {
        fetchCountryTodayCounts(cid);
      }
    }
    setIsRefreshing(false);
  };

  // (moved getSortFunction above to avoid use-before-declare)

  // Load countries on mount
  useEffect(() => {
    loadCountriesWithLeagues();
  }, []);

  // Auto-collapse when navigating to a league page
  useEffect(() => {
    if (pathname?.startsWith('/predictions/league')) {
      setExpandedCountries(new Set());
    }
  }, [pathname]);

  // Show skeleton while data is loading (but don't block initial render)
  if (isLoading || allCountries.length === 0) {
    return (
      <SidebarTheme>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarTheme>
    );
  }

  return (
    <SidebarTheme>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-3 border-b">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              />
            </div>
          
          {/* Active Filters Display */}
          {(debouncedSearch.trim() || showOnlyFavorites || hideRegions) && (
            <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">Active Filters:</div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowOnlyFavorites(false);
                    setHideRegions(false);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Clear all filters"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {debouncedSearch.trim() && (
                  <Badge variant="secondary" className="text-xs">
                    Search: &ldquo;{debouncedSearch}&rdquo;
                  </Badge>
                )}
                {showOnlyFavorites && (
                  <Badge variant="secondary" className="text-xs">
                    Favorites Only ({favorites.size})
                  </Badge>
                )}
                {hideRegions && (
                  <Badge variant="secondary" className="text-xs">
                    Tournaments Hidden
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Controls Row */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                showOnlyFavorites 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={showOnlyFavorites ? 'Show all countries' : 'Show only favorites'}
            >
              <Star className="h-3 w-3" />
              <span>Favorites</span>
            </button>
            

            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
            </button>

            <button
              onClick={() => setHideRegions(!hideRegions)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                hideRegions
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={hideRegions ? 'Show continental tournaments (UEFA, CAF, etc.)' : 'Hide continental tournaments'}
            >
              <Globe className="h-3 w-3" />
              <span>{hideRegions ? 'Show tournaments' : 'Hide tournaments'}</span>
            </button>
            
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
              title="Sort options"
            >
              <Settings className="h-3 w-3" />
            </button>
          </div>
          
          {/* Sort Options */}
          {showSettings && (
            <div className="mb-3 p-2 bg-muted rounded text-xs">
              <div className="font-medium mb-2">Sort by:</div>
              <div className="flex gap-2">
                {(['name', 'fixtures', 'leagues'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-2 py-1 rounded transition-colors ${
                      sortBy === option 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background hover:bg-accent'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>{countryItems.length} countries</span>
            {showOnlyFavorites && (
              <Badge variant="outline" className="text-xs">
                {favorites.size} favorites
              </Badge>
            )}

            <div className="flex items-center gap-1 text-xs opacity-75" title="Only one country can be expanded at a time">
              <Info className="h-3 w-3" />
            </div>
            {regionItems.length > 0 && !hideRegions && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                {regionItems.length} tournaments
              </Badge>
            )}
            {allCountries.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {allCountries.filter(c => (c.fixtureCount || 0) > 0).length} active
              </Badge>
            )}
          </div>
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-y-auto">
          {/* Countries Section */}
          <div className="p-1">
            <div className="px-1 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">Countries</div>
            <div className="space-y-0.5">
            {countryItems.map((country) => {
              const isExpanded = expandedCountries.has(country.id);
              const leagues = countryLeagues.get(country.id) || [];
              const isLoadingLeagues = loadingStates.get(country.id) || false;

              return (
                 <div key={country.id} className="space-y-0.5" id={`country-${country.id}`}>
                  {/* Country Header */}
                  <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                    <button
                      onClick={() => toggleCountry(country.id)}
                      className="flex items-center gap-1.5 flex-1 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                      <span className={`font-medium truncate text-sm max-w-[180px] ${
                        (country.leaguesCount || 0) === 0 ? 'text-muted-foreground italic' : ''
                      }`} title={country.name || country.fifa_name || country.official_name || ''}>
                        {country.name || country.fifa_name || country.official_name}
                      </span>
                      {isRegion(country) && (
                        <Badge variant="outline" className="text-[10px] ml-1">
                          Tournament
                        </Badge>
                      )}
                      {countsLoadingCountries.has(country.id) ? (
                        <Skeleton title="Fetching..." className="ml-1 inline-block h-3 w-6" />
                      ) : (
                        (() => {
                          const c = countryTodayCounts.get(country.id) ?? 0;
                          return (
                            <Badge
                              variant="outline"
                              className={`text-[10px] ml-1 ${
                                c > 0
                                  ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                              title={c > 0 ? `${c} fixtures today` : 'No fixtures today'}
                            >
                              {c}
                            </Badge>
                          );
                        })()
                      )}
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                      {/* Favorite Star */}
                      <button
                        onClick={(e) => toggleFavorite(country.id, e)}
                        className={`transition-colors ${
                          favorites.has(country.id)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-muted-foreground hover:text-yellow-500'
                        }`}
                        title={favorites.has(country.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.has(country.id) ? (
                          <Star className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <StarOff className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <a
                        href={getCountryPredictionsUrl(country)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="View all leagues"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Leagues List */}
                  {isExpanded && (
                    <div className="ml-4 space-y-0.5">
                      {isLoadingLeagues ? (
                        <div className="p-1.5 text-xs text-muted-foreground">
                          Loading leagues...
                        </div>
                      ) : leagues.length > 0 ? (
                        leagues.map((league) => {
                          const active = pathname?.startsWith('/predictions/league') && searchParams?.get('id') === String(league.id);
                          return (
                            <div key={league.id} className={`flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${active ? 'bg-accent/60' : ''}`}>
                              <a
                                href={`/predictions/league/${generateLeagueSlug(league)}?id=${league.id}`}
                                className={`flex items-center gap-1.5 flex-1 text-xs ${active ? 'text-primary font-medium' : ''}`}
                                title={`League ID: ${league.id}`}
                              >
                                <span className="truncate">{league.name}</span>
                                {league.short_code && (
                                  <Badge variant="outline" className={`text-xs px-1 py-0.5 ${active ? 'border-primary text-primary' : ''}`}>
                                    {league.short_code}
                                  </Badge>
                                )}
                                {isLoadingLeagues || countsLoadingCountries.has(country.id) ? (
                                  <Skeleton title="Fetching..." className="ml-1 inline-block h-3 w-5" />
                                ) : (
                                  (() => {
                                    const lc = leagueTodayCounts.get(league.id) ?? 0;
                                    const lVisible = visibleLeagueBadges.has(league.id);
                                    return (
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] transition-opacity duration-300 ${
                                          lVisible ? 'opacity-100' : 'opacity-0'
                                        } ${
                                          lc > 0
                                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                        title={lc > 0 ? `${lc} fixtures today` : 'No fixtures today'}
                                      >
                                        {lc}
                                      </Badge>
                                    );
                                  })()
                                )}
                              </a>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-1.5 text-xs text-muted-foreground">
                          No active leagues found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </div>

          {/* Continental Tournaments Section */}
          {!hideRegions && regionItems.length > 0 && (
            <div className="p-1 mt-2">
              <div className="px-1 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">Continental Tournaments</div>
              <div className="space-y-0.5">
              {regionItems.map((country) => {
                const isExpanded = expandedCountries.has(country.id);
                const leagues = countryLeagues.get(country.id) || [];
                const isLoadingLeagues = loadingStates.get(country.id) || false;

                return (
                  <div key={country.id} className="space-y-0.5" id={`country-${country.id}`}>
                    {/* Country Header */}
                    <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                      <button
                        onClick={() => toggleCountry(country.id)}
                        className="flex items-center gap-1.5 flex-1 text-left"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        <span className={`font-medium truncate text-sm max-w-[180px] ${
                          (country.leaguesCount || 0) === 0 ? 'text-muted-foreground italic' : ''
                        }`} title={country.name || country.fifa_name || country.official_name || ''}>
                          {country.name || country.fifa_name || country.official_name}
                        </span>
                        <Badge variant="outline" className="text-[10px] ml-1">Tournament</Badge>
                        {countsLoadingCountries.has(country.id) ? (
                          <Skeleton title="Fetching..." className="ml-1 inline-block h-3 w-6" />
                        ) : (
                          (() => {
                            const c = countryTodayCounts.get(country.id) ?? 0;
                            return (
                              <Badge
                                variant="outline"
                                className={`text-[10px] ml-1 ${
                                  c > 0
                                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                                title={c > 0 ? `${c} fixtures today` : 'No fixtures today'}
                              >
                                {c}
                              </Badge>
                            );
                          })()
                        )}
                      </button>
                      <div className="flex items-center gap-1.5">
                        {/* Favorite Star */}
                        <button
                          onClick={(e) => toggleFavorite(country.id, e)}
                          className={`transition-colors ${
                            favorites.has(country.id)
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-muted-foreground hover:text-yellow-500'
                          }`}
                          title={favorites.has(country.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {favorites.has(country.id) ? (
                            <Star className="h-3.5 w-3.5 fill-current" />
                          ) : (
                            <StarOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <a
                          href={getCountryPredictionsUrl(country)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="View all leagues"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Leagues List */}
                    {isExpanded && (
                      <div className="ml-4 space-y-0.5">
                        {isLoadingLeagues ? (
                          <div className="p-1.5 text-xs text-muted-foreground">
                            Loading leagues...
                          </div>
                        ) : leagues.length > 0 ? (
                          leagues.map((league) => {
                            const active = pathname?.startsWith('/predictions/league') && searchParams?.get('id') === String(league.id);
                            return (
                              <div key={league.id} className={`flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${active ? 'bg-accent/60' : ''}`}>
                                <a
                                  href={`/predictions/league/${generateLeagueSlug(league)}?id=${league.id}`}
                                  className={`flex items-center gap-1.5 flex-1 text-xs ${active ? 'text-primary font-medium' : ''}`}
                                  title={`League ID: ${league.id}`}
                                >
                                  <span className="truncate">{league.name}</span>
                                  {league.short_code && (
                                    <Badge variant="outline" className={`text-xs px-1 py-0.5 ${active ? 'border-primary text-primary' : ''}`}>
                                      {league.short_code}
                                    </Badge>
                                  )}
                                  {isLoadingLeagues || countsLoadingCountries.has(country.id) ? (
                                    <Skeleton title="Fetching..." className="ml-1 inline-block h-3 w-5" />
                                  ) : (
                                    (() => {
                                      const lc = leagueTodayCounts.get(league.id) ?? 0;
                                      const lVisible = visibleLeagueBadges.has(league.id);
                                      return (
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] transition-opacity duration-300 ${
                                            lVisible ? 'opacity-100' : 'opacity-0'
                                          } ${
                                            lc > 0
                                              ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                              : 'bg-muted text-muted-foreground'
                                          }`}
                                          title={lc > 0 ? `${lc} fixtures in next 7 days` : 'No fixtures in next 7 days'}
                                        >
                                          {lc}
                                        </Badge>
                                      );
                                    })()
                                  )}
                                </a>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-1.5 text-xs text-muted-foreground">
                            No active leagues found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          )}
          </div>

        {/* Sidebar Footer */}
        <div className="mt-auto border-t border-border bg-muted/30 p-3">
          <div className="space-y-2">
            {/* Quick Stats */}
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Countries:</span>
                <span className="font-medium">{countryItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Tournaments:</span>
                <span className="font-medium">{regionItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Favorites:</span>
                <span className="font-medium">{favorites.size}</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setExpandedCountries(new Set());
                  setSearchTerm('');
                  setShowOnlyFavorites(false);
                }}
                className="flex-1 px-2 py-1 text-xs bg-background border border-border rounded hover:bg-muted transition-colors"
                title="Collapse all and clear filters"
              >
                Reset
              </button>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="flex-1 px-2 py-1 text-xs bg-background border border-border rounded hover:bg-muted transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                {isRefreshing ? <RefreshCw className="h-3 w-3 animate-spin mx-auto" /> : 'Refresh'}
              </button>
            </div>
            
            {/* Version Info */}
            <div className="text-[10px] text-muted-foreground text-center pt-1 border-t border-border">
              Prediops v2.7.0
            </div>
          </div>
        </div>
      </div>
    </SidebarTheme>
  );
});

export default Sidebar; 