'use client';

import React, { useState, useEffect, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink,
  Star,
  StarOff,
  Globe,
  Trophy,
  Users,
  Clock,
  Settings,
  RefreshCw,
  Calendar,
  Eye,
  Download
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SidebarTheme } from './SidebarTheme';
import { getCountryPredictionsUrl, generateLeagueSlug } from '@/lib/utils/country-utils';
import type { Country } from '@/schemas/country.schema';
import { Logo } from '@/components/ui/Logo';

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
  country_id?: number;
}

// Global cache for search data with expiry
const searchDataCache = {
  countries: { data: [] as CountryWithLeagues[], timestamp: 0, ttl: 5 * 60 * 1000 }, // 5 minutes
  leagues: { data: [] as League[], timestamp: 0, ttl: 5 * 60 * 1000 },
  teams: { data: [] as { id: number; name: string; image_path?: string; country_id?: number }[], timestamp: 0, ttl: 5 * 60 * 1000 },
  fixtures: { data: [] as { id: number; starting_at: string; participants: { id: number; name: string }[]; league: { id: number; name: string; country_id?: number } }[], timestamp: 0, ttl: 2 * 60 * 1000 }, // 2 minutes for fixtures (more dynamic)
};

// Cache helper functions
const getCachedData = <T,>(cache: { data: T[]; timestamp: number; ttl: number }): T[] | null => {
  const now = Date.now();
  if (cache.timestamp && (now - cache.timestamp) < cache.ttl && cache.data.length > 0) {
    return cache.data;
  }
  return null;
};

const setCachedData = <T,>(cache: { data: T[]; timestamp: number; ttl: number }, data: T[]) => {
  cache.data = data;
  cache.timestamp = Date.now();
};

// Search Results Dropdown Component
function SearchResults({ searchTerm }: { searchTerm: string }) {
  const [searchResults, setSearchResults] = useState<{
    countries: CountryWithLeagues[];
    leagues: { country: CountryWithLeagues; league: League }[];
    teams: { country: CountryWithLeagues; team: { id: number; name: string; image_path?: string } }[];
    tournaments: CountryWithLeagues[];
    fixtures: { 
      fixture: { 
        id: number; 
        starting_at: string; 
        participants: { id: number; name: string }[]; 
        league: { id: number; name: string } 
      }; 
      country: CountryWithLeagues 
    }[];
    hasResults: boolean;
  }>({ 
    countries: [], 
    leagues: [], 
    teams: [], 
    tournaments: [],
    fixtures: [],
    hasResults: false 
  });
  
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = React.useRef(false);

  // Debounced search - increased to 400ms to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Optimized data loading with caching and lazy loading
  useEffect(() => {
    const loadSearchData = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setSearchResults({ 
          countries: [], 
          leagues: [], 
          teams: [], 
          tournaments: [],
          fixtures: [],
          hasResults: false 
        });
        return;
      }
      
      // Prevent duplicate concurrent requests
      if (loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);
      
      try {
        const searchLower = debouncedSearchTerm.toLowerCase();
        
        // Phase 1: Load countries (always needed, usually cached)
        let countries: CountryWithLeagues[] = getCachedData(searchDataCache.countries) || [];
        if (countries.length === 0) {
          const countriesRes = await fetch('/api/sportmonks/countries/with-leagues');
          const countriesData = await countriesRes.json();
          if (countriesData.success) {
            countries = countriesData.data || [];
            setCachedData(searchDataCache.countries, countries);
          }
        }
        
        // Filter countries immediately
        const matchingCountries = countries.filter((country) => {
          const name = (country.name || country.fifa_name || country.official_name || '').toLowerCase();
          return name.includes(searchLower);
        });
        
        // Determine if we need leagues/teams/fixtures based on search term
        const needsLeagues = searchLower.length >= 3; // Only load if 3+ chars
        const needsTeams = searchLower.length >= 3;
        const needsFixtures = searchLower.length >= 4; // Only for longer searches
        
        // Phase 2: Load leagues if needed
        let leagues: League[] = [];
        if (needsLeagues) {
          leagues = getCachedData(searchDataCache.leagues) || [];
          if (leagues.length === 0) {
            const leaguesRes = await fetch('/api/sportmonks/leagues?per_page=100&page=1');
            const leaguesData = await leaguesRes.json();
            if (leaguesData.success) {
              leagues = leaguesData.data || [];
              setCachedData(searchDataCache.leagues, leagues);
            }
          }
        }
        
        // Phase 3: Load teams if needed
        let teams: { id: number; name: string; image_path?: string; country_id?: number }[] = [];
        if (needsTeams) {
          teams = getCachedData(searchDataCache.teams) || [];
          if (teams.length === 0) {
            const teamsRes = await fetch('/api/sportmonks/teams?per_page=100&page=1');
            const teamsData = await teamsRes.json();
            if (teamsData.success) {
              teams = teamsData.data || [];
              setCachedData(searchDataCache.teams, teams);
            }
          }
        }
        
        // Phase 4: Load fixtures if needed
        let fixtures: { id: number; starting_at: string; participants: { id: number; name: string }[]; league: { id: number; name: string; country_id?: number } }[] = [];
        if (needsFixtures) {
          fixtures = getCachedData(searchDataCache.fixtures) || [];
          if (fixtures.length === 0) {
            const fixturesRes = await fetch(`/api/sportmonks/fixtures/upcoming?per_page=50&page=1`);
            const fixturesData = await fixturesRes.json();
            if (fixturesData.success) {
              fixtures = fixturesData.data || [];
              setCachedData(searchDataCache.fixtures, fixtures);
            }
          }
        }
        
        // Process search results
        const results = {
          countries: matchingCountries,
          leagues: [] as { country: CountryWithLeagues; league: League }[],
          teams: [] as { country: CountryWithLeagues; team: { id: number; name: string; image_path?: string } }[],
          tournaments: [] as CountryWithLeagues[],
          fixtures: [] as { fixture: { id: number; starting_at: string; participants: { id: number; name: string }[]; league: { id: number; name: string } }; country: CountryWithLeagues }[],
          hasResults: false
        };
        
        // Filter leagues
        if (needsLeagues) {
          const matchingLeagues = leagues.filter(league => 
            league.name.toLowerCase().includes(searchLower) ||
            (league.short_code && league.short_code.toLowerCase().includes(searchLower))
          );
          
          matchingLeagues.forEach(league => {
            const country = countries.find(c => c.id === league.country_id);
            if (country) {
              results.leagues.push({ country, league });
            }
          });
        }
        
        // Filter teams
        if (needsTeams) {
          const matchingTeams = teams.filter(team => 
            team.name.toLowerCase().includes(searchLower)
          );
          
          matchingTeams.forEach(team => {
            const country = countries.find(c => c.id === team.country_id);
            if (country) {
              results.teams.push({ country, team });
            }
          });
        }
        
        // Filter fixtures
        if (needsFixtures) {
          const matchingFixtures = fixtures.filter(fixture => {
            const homeTeam = fixture.participants[0]?.name?.toLowerCase() || '';
            const awayTeam = fixture.participants[1]?.name?.toLowerCase() || '';
            const leagueName = fixture.league?.name?.toLowerCase() || '';
            
            return homeTeam.includes(searchLower) || 
                   awayTeam.includes(searchLower) || 
                   leagueName.includes(searchLower);
          });
          
          matchingFixtures.forEach(fixture => {
            const country = countries.find(c => c.id === fixture.league.country_id);
            if (country) {
              results.fixtures.push({ fixture, country });
            }
          });
        }
        
        // Filter tournaments
        const matchingTournaments = matchingCountries.filter((country) => {
          const name = (country.name || country.fifa_name || country.official_name || '').toLowerCase();
          
          const tournamentKeywords = [
            'champions league', 'europa league', 'europa conference league', 'conference league',
            'african cup', 'asian cup', 'copa america', 'gold cup', 'oceanian cup',
            'nations league', 'confederations cup', 'club world cup', 'super cup',
            'world cup', 'euro', 'copa libertadores', 'copa sudamericana', 'uefa', 'caf', 'afc'
          ];
          
          return tournamentKeywords.some(keyword => name.includes(keyword)) ||
                 name.includes('continental') || name.includes('regional') ||
                 name.includes('intercontinental');
        });
        
        results.tournaments = matchingTournaments;
        results.hasResults = results.countries.length > 0 || 
                            results.leagues.length > 0 || 
                            results.teams.length > 0 ||
                            results.tournaments.length > 0 ||
                            results.fixtures.length > 0;
        
        setSearchResults(results);
      } catch (error) {
        console.error('Error loading search data:', error);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    loadSearchData();
  }, [debouncedSearchTerm]);

  // Don't show if no search term or no results
  if (!debouncedSearchTerm.trim() || !searchResults.hasResults) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-3">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
          <Search className="h-3 w-3" />
          Results for &ldquo;{debouncedSearchTerm}&rdquo;
          {isLoading && <div className="ml-2 h-3 w-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />}
        </div>
        
        <div className="space-y-3">
          {/* Fixtures Results - Show first as they're most relevant */}
          {searchResults.fixtures.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Upcoming Matches ({searchResults.fixtures.length})
              </div>
              <div className="space-y-1">
                {searchResults.fixtures.slice(0, 3).map((item, index) => (
                  <a
                    key={`${item.fixture.id}-${index}`}
                    href={`/predictions/league/${item.fixture.league.id}/${generateLeagueSlug({ name: item.fixture.league.name, id: item.fixture.league.id })}`}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs">
                        {item.fixture.participants[0]?.name} vs {item.fixture.participants[1]?.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.fixture.league.name}
                      </div>
                    </div>
                  </a>
                ))}
                {searchResults.fixtures.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    +{searchResults.fixtures.length - 3} more matches
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Teams Results */}
          {searchResults.teams.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Teams ({searchResults.teams.length})
              </div>
              <div className="space-y-1">
                {searchResults.teams.slice(0, 4).map((item, index) => (
                  <a
                    key={`${item.country.id}-${item.team.id}-${index}`}
                    href={`/team/${item.team.id}/${item.team.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="truncate flex-1">{item.team.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      ({item.country.name})
                    </span>
                  </a>
                ))}
                {searchResults.teams.length > 4 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    +{searchResults.teams.length - 4} more teams
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leagues Results */}
          {searchResults.leagues.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Leagues ({searchResults.leagues.length})
              </div>
              <div className="space-y-1">
                {searchResults.leagues.slice(0, 4).map((item, index) => (
                  <a
                    key={`${item.country.id}-${item.league.id}-${index}`}
                    href={`/predictions/league/${item.league.id}/${generateLeagueSlug({ name: item.league.name, id: item.league.id })}`}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Trophy className="h-4 w-4 text-green-500" />
                    <span className="truncate flex-1">{item.league.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      ({item.country.name})
                    </span>
                  </a>
                ))}
                {searchResults.leagues.length > 4 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    +{searchResults.leagues.length - 4} more leagues
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tournaments Results */}
          {searchResults.tournaments.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Tournaments ({searchResults.tournaments.length})
              </div>
              <div className="space-y-1">
                {searchResults.tournaments.slice(0, 3).map((tournament) => (
                  <a
                    key={tournament.id}
                    href={getCountryPredictionsUrl(tournament)}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="truncate flex-1">{tournament.name || tournament.fifa_name}</span>
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800">
                      Tournament
                    </Badge>
                  </a>
                ))}
                {searchResults.tournaments.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    +{searchResults.tournaments.length - 3} more tournaments
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Countries Results */}
          {searchResults.countries.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Countries ({searchResults.countries.length})
              </div>
              <div className="space-y-1">
                {searchResults.countries.slice(0, 3).map((country) => (
                  <a
                    key={country.id}
                    href={getCountryPredictionsUrl(country)}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="truncate flex-1">{country.name || country.fifa_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {country.leaguesCount || 0}
                    </Badge>
                  </a>
                ))}
                {searchResults.countries.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    +{searchResults.countries.length - 3} more countries
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Static shell that can be prerendered with full functionality
interface SidebarStaticProps {
  showLogo?: boolean;
}

export const SidebarStatic = memo(function SidebarStatic({ showLogo = false }: SidebarStaticProps = {}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  
  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  if (isHomePage) {
    return null;
  }

  return (
    <SidebarTheme>
      <div className="flex flex-col h-full">
        {/* Logo Header - Only show on mobile or when explicitly requested */}
        {showLogo && (
          <div className="p-3 border-b border-sidebar-border">
            <Logo size="sm" showText={true} />
          </div>
        )}
        
        {/* Header with Search */}
        <div className="p-2 border-b">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search countries, leagues..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Search Results Dropdown */}
            <SearchResults searchTerm={searchTerm} />
          </div>
          
          {/* Utility Tools Row */}
          <div className="flex items-center justify-between gap-1 mb-2">
            {/* Left side - Filter tools */}
            <div className="flex items-center gap-1">
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-accent ${
                  showFavoritesOnly 
                    ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Show only favorites"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Star className={`h-3 w-3 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">Favorites</span>
              </button>
              
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-accent ${
                  showActiveOnly 
                    ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Show only active leagues"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
              >
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">Active</span>
              </button>
              
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-accent ${
                  showTodayOnly 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Show leagues with fixtures today"
                onClick={() => setShowTodayOnly(!showTodayOnly)}
              >
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">Today</span>
              </button>
            </div>
            
            {/* Right side - Action tools */}
            <div className="flex items-center gap-1">
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors text-muted-foreground hover:text-foreground hover:bg-accent ${isRefreshing ? 'cursor-wait' : ''}`}
                title="Refresh data"
                disabled={isRefreshing}
                onClick={() => {
                  setRefreshTrigger(prev => prev + 1);
                }}
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              <button
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
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
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
                title="Sidebar settings"
                onClick={() => {
                  // Open settings modal or toggle settings
                  console.log('Open sidebar settings');
                }}
              >
                <Settings className="h-3 w-3" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area - This will stream in */}
        <div className="flex-1 overflow-auto">
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
  onRefreshStateChange
}: { 
  searchTerm: string;
  showFavoritesOnly: boolean;
  showActiveOnly: boolean;
  showTodayOnly: boolean;
  refreshTrigger: number;
  onRefreshStateChange: (isRefreshing: boolean) => void;
}) {
  const [allCountries, setAllCountries] = useState<CountryWithLeagues[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryWithLeagues[]>([]);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [countryLeagues, setCountryLeagues] = useState<Map<number, League[]>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<number, boolean>>(new Map());
  const [isLoading] = useState(false);
  const pathname = usePathname();
  
  // Favorites and filtering state - load from localStorage
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-favorites');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });
  // Today fixture counts
  const [countryTodayCounts, setCountryTodayCounts] = useState<Map<number, number>>(new Map());
  const [loadingCounts, setLoadingCounts] = useState<Set<number>>(new Set());
  // League fixture counts
  const [leagueFixtureCounts, setLeagueFixtureCounts] = useState<Map<number, number>>(new Map());
  const [loadingLeagueCounts, setLoadingLeagueCounts] = useState<Set<number>>(new Set());
  
  // Section collapse state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
  // Virtual scrolling container ref
  const countriesContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Toggle section collapse
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Set<number>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-favorites', JSON.stringify(Array.from(newFavorites)));
    }
  };

  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      saveFavorites(newSet);
      return newSet;
    });
  };

  // Define known continental/tournament entities by ID and patterns
  const KNOWN_TOURNAMENTS = React.useMemo(() => new Set([
    41,   // Europe
    147,  // Africa  
    11240938, // Asia (AFC)
    // Add more known tournament IDs as we discover them
  ]), []);

  const isTournament = React.useCallback((country: CountryWithLeagues) => {
    // Check by known ID first
    if (KNOWN_TOURNAMENTS.has(country.id)) return true;
    
    const name = (country.name || country.fifa_name || country.official_name || '').trim().toLowerCase();
    if (!name) return false;
    
    // Continental/regional organizations and tournaments (not real countries)
    const continents = new Set([
      'africa', 'europe', 'asia', 'north america', 'south america', 'oceania', 'antarctica', 'world', 'international'
    ]);
    if (continents.has(name)) return true;
    
    // Continental football organizations
    const orgs = ['uefa', 'caf', 'afc', 'conmebol', 'concacaf', 'ofc', 'fifa'];
    
    // Check in name and codes
    const code = (country.fifa_name || country.official_name || '').trim().toLowerCase();
    if (orgs.some(org => name.includes(org) || code.includes(org))) return true;
    
    // Check for tournament-specific patterns
    if (name.includes('continental') || name.includes('regional') || name.includes('intercontinental')) return true;
    
    // Check for specific tournament keywords
    const tournamentKeywords = [
      'champions league', 'europa league', 'europa conference league', 'conference league',
      'african cup', 'asian cup', 'copa america', 'gold cup', 'oceanian cup',
      'nations league', 'confederations cup', 'club world cup', 'super cup',
      'world cup', 'euro', 'copa libertadores', 'copa sudamericana'
    ];
    
    if (tournamentKeywords.some(keyword => name.includes(keyword))) return true;
    
    return false;
  }, [KNOWN_TOURNAMENTS]);

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

  // Define top leagues data with actual league IDs from SportMonks API
  const topLeagues = React.useMemo(() => [
    { id: 8, name: 'Premier League', country: 'England', short_code: 'EPL', countryId: 462 },
    { id: 564, name: 'La Liga', country: 'Spain', short_code: 'LL', countryId: 32 },
    { id: 384, name: 'Serie A', country: 'Italy', short_code: 'SA', countryId: 251 },
    { id: 351, name: 'Bundesliga', country: 'Germany', short_code: 'BL', countryId: 11 },
    { id: 301, name: 'Ligue 1', country: 'France', short_code: 'L1', countryId: 17 },
    { id: 7, name: 'Championship', country: 'England', short_code: 'CH', countryId: 462 },
    { id: 72, name: 'Eredivisie', country: 'Netherlands', short_code: 'ED', countryId: 38 },
    { id: 238, name: 'Primeira Liga', country: 'Portugal', short_code: 'PL', countryId: 20 },
  ], []);

  // Load fixture counts for a specific league (next 7 days)
  const loadLeagueFixtureCounts = React.useCallback(async (leagueId: number) => {
    if (loadingLeagueCounts.has(leagueId) || leagueFixtureCounts.has(leagueId)) {
      return; // Already loading or loaded
    }

    setLoadingLeagueCounts(prev => new Set(prev).add(leagueId));

    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const startDate = today.toISOString().split('T')[0];
      const endDate = nextWeek.toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/sportmonks/leagues/${leagueId}/fixtures?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        const count = data.data.length || 0;
        setLeagueFixtureCounts(prev => new Map(prev).set(leagueId, count));
      } else {
        setLeagueFixtureCounts(prev => new Map(prev).set(leagueId, 0));
      }
    } catch (error) {
      console.error('Error loading fixture counts for league:', leagueId, error);
      setLeagueFixtureCounts(prev => new Map(prev).set(leagueId, 0));
    } finally {
      setLoadingLeagueCounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(leagueId);
        return newSet;
      });
    }
  }, [leagueFixtureCounts, loadingLeagueCounts]);

  // Load countries with leagues using API route
  const loadCountriesWithLeagues = async () => {
    try {
      const response = await fetch('/api/sportmonks/countries/with-leagues');
      const data = await response.json();
      
      if (data.success) {
        const countries = data.data || [];
        setAllCountries(countries);
        setFilteredCountries(countries);
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
  };

  // Load leagues for a specific country using API route
  const loadCountryLeagues = React.useCallback(async (countryId: number) => {
    if (countryLeagues.has(countryId)) {
      return; // Already loaded
    }

    setLoadingStates(prev => new Map(prev).set(countryId, true));
    
    try {
      const response = await fetch(`/api/sportmonks/leagues/country/${countryId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const leagues = data.data.filter((league: League) => league.active);
        setCountryLeagues(prev => new Map(prev).set(countryId, leagues));
        
        // Load fixture counts for the leagues
        leagues.forEach((league: League) => {
          loadLeagueFixtureCounts(league.id);
        });
      } else {
        console.error('Failed to load leagues for country:', countryId, data.error);
        setCountryLeagues(prev => new Map(prev).set(countryId, []));
      }
    } catch (error) {
      console.error('Error loading leagues for country:', countryId, error);
      setCountryLeagues(prev => new Map(prev).set(countryId, []));
    } finally {
      setLoadingStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(countryId);
        return newMap;
      });
    }
  }, [countryLeagues, loadLeagueFixtureCounts]);

  // Toggle country expansion
  const toggleCountry = React.useCallback((countryId: number) => {
    setExpandedCountries(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(countryId)) {
        newExpanded.delete(countryId);
      } else {
        newExpanded.add(countryId);
        // Load leagues when expanding
        loadCountryLeagues(countryId);
      }
      return newExpanded;
    });
  }, [loadCountryLeagues]);

  // Load today's fixture counts for a country
  const loadTodayFixtureCounts = React.useCallback(async (countryId: number) => {
    if (loadingCounts.has(countryId) || countryTodayCounts.has(countryId)) {
      return; // Already loading or loaded
    }

    setLoadingCounts(prev => new Set(prev).add(countryId));

    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/sportmonks/fixtures/date-country?date=${today}&countryId=${countryId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const count = data.data.length || 0;
        console.log(`Loaded ${count} fixtures for country ${countryId} on ${today}`);
        setCountryTodayCounts(prev => new Map(prev).set(countryId, count));
      } else {
        console.log(`No fixtures found for country ${countryId} on ${today}`, data);
        setCountryTodayCounts(prev => new Map(prev).set(countryId, 0));
      }
    } catch (error) {
      console.error('Error loading fixture counts for country:', countryId, error);
      setCountryTodayCounts(prev => new Map(prev).set(countryId, 0));
    } finally {
      setLoadingCounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(countryId);
        return newSet;
      });
    }
  }, [countryTodayCounts, loadingCounts]);

  // Load countries on mount
  useEffect(() => {
    loadCountriesWithLeagues();
  }, []);

  // Load fixture counts for top leagues on mount
  useEffect(() => {
    topLeagues.forEach(league => {
      loadLeagueFixtureCounts(league.id);
    });
  }, [topLeagues, loadLeagueFixtureCounts]);

  // Handle refresh trigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      const performRefresh = async () => {
        onRefreshStateChange(true);
        try {
          // Clear all caches
          setCountryLeagues(new Map());
          setCountryTodayCounts(new Map());
          setLeagueFixtureCounts(new Map());
          setExpandedCountries(new Set());
          
          // Reload countries
          await loadCountriesWithLeagues();
          
          // Reload top leagues fixture counts
          topLeagues.forEach(league => {
            loadLeagueFixtureCounts(league.id);
          });
        } finally {
          onRefreshStateChange(false);
        }
      };
      
      performRefresh();
    }
  }, [refreshTrigger, onRefreshStateChange, topLeagues, loadLeagueFixtureCounts]);

  // Load fixture counts for visible countries
  useEffect(() => {
    // Load counts for first 20 countries to get better coverage
    const visibleCountries = filteredCountries.slice(0, 20);
    visibleCountries.forEach(country => {
      // Load counts for all countries with leagues, not just active ones
      if (country.leaguesCount > 0 && !loadingCounts.has(country.id) && !countryTodayCounts.has(country.id)) {
        loadTodayFixtureCounts(country.id);
      }
    });
  }, [filteredCountries, loadTodayFixtureCounts, loadingCounts, countryTodayCounts]);

  // Setup virtual scrolling for countries list
  const countriesVirtualizer = useVirtualizer({
    count: countryItems.length,
    getScrollElement: () => countriesContainerRef.current,
    estimateSize: () => 45, // Estimated height of each country item
    overscan: 5, // Render 5 extra items above and below visible area
  });
  
  // Filter countries based on search term and filter options
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
    
    setFilteredCountries(filtered);
  }, [searchTerm, allCountries, showFavoritesOnly, showActiveOnly, showTodayOnly, favorites, countryTodayCounts]);

  // Show skeleton while data is loading
  if (isLoading || allCountries.length === 0) {
    return <SidebarContentSkeleton />;
  }

  return (
    <div className="p-1">
      
      
      {/* 1. Countries Section */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('countries')}
          className="w-full flex items-center justify-between px-3 py-2.5 mb-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/40 dark:hover:to-blue-800/40 transition-all duration-200 group border border-blue-200/50 dark:border-blue-700/50"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Countries</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
              {countryItems.length}
            </Badge>
          </div>
          {collapsedSections.has('countries') ? (
            <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
          )}
        </button>
        
        {!collapsedSections.has('countries') && (
          <div 
            ref={countriesContainerRef}
            className="max-h-[calc(100vh/3)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
            style={{ position: 'relative' }}
          >
            <div
              style={{
                height: `${countriesVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
          {countriesVirtualizer.getVirtualItems().map((virtualItem) => {
            const country = countryItems[virtualItem.index];
            const isExpanded = expandedCountries.has(country.id);
            const leagues = countryLeagues.get(country.id) || [];
            const isLoadingLeagues = loadingStates.get(country.id) || false;
            const countryName = country.name || country.fifa_name || country.official_name || '';

            return (
              <div 
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={countriesVirtualizer.measureElement}
                className="space-y-0.5" 
                id={`country-${country.id}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {/* Country Header */}
                <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                  <button
                    onClick={() => toggleCountry(country.id)}
                    className="flex items-center gap-1.5 flex-1 text-left min-w-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    <span 
                      className={`font-medium truncate text-sm max-w-[120px] ${
                        (country.leaguesCount || 0) === 0 ? 'text-muted-foreground italic' : ''
                      }`} 
                      title={countryName}
                    >
                      {countryName}
                    </span>
                    {loadingCounts.has(country.id) ? (
                      <div className="ml-1 h-4 w-6 bg-muted animate-pulse rounded flex-shrink-0" />
                    ) : (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ml-1 flex-shrink-0 ${
                          (countryTodayCounts.get(country.id) ?? 0) > 0
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-muted text-muted-foreground'
                        }`}
                        title={(countryTodayCounts.get(country.id) ?? 0) > 0 ? `${countryTodayCounts.get(country.id)} fixtures today` : 'No fixtures today'}
                      >
                        {countryTodayCounts.get(country.id) ?? 0}
                      </Badge>
                    )}
                  </button>
                  
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Favorite Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(country.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        favorites.has(country.id)
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-muted-foreground hover:text-yellow-500'
                      }`}
                      title={favorites.has(country.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.has(country.id) ? (
                        <Star className="h-3 w-3 fill-current" />
                      ) : (
                        <StarOff className="h-3 w-3" />
                      )}
                    </button>
                    <a
                      href={getCountryPredictionsUrl(country)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Open predictions page"
                    >
                      <ExternalLink className="h-3 w-3" />
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
                        const active = pathname?.includes(`/predictions/league/${league.id}/`);
                        const fixtureCount = leagueFixtureCounts.get(league.id) ?? 0;
                        const isLoadingCount = loadingLeagueCounts.has(league.id);
                        
                        return (
                          <div key={league.id} className={`flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${active ? 'bg-accent/60' : ''}`}>
                            <a
                              href={`/predictions/league/${league.id}/${generateLeagueSlug({ name: league.name, id: league.id })}`}
                              className={`flex items-center gap-1.5 flex-1 text-xs min-w-0 ${active ? 'text-primary font-medium' : ''}`}
                              title={`League ID: ${league.id}`}
                            >
                              <span className="truncate max-w-[100px]" title={league.name}>{league.name}</span>
                              {league.short_code && (
                                <Badge variant="outline" className={`text-xs px-1 py-0.5 flex-shrink-0 ${active ? 'border-primary text-primary' : ''}`}>
                                  {league.short_code}
                                </Badge>
                              )}
                              {isLoadingCount ? (
                                <div className="h-4 w-6 bg-muted animate-pulse rounded flex-shrink-0" />
                              ) : (
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] flex-shrink-0 ${
                                    fixtureCount > 0
                                      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                  title={fixtureCount > 0 ? `${fixtureCount} fixtures in next 7 days` : 'No fixtures in next 7 days'}
                                >
                                  {fixtureCount}
                                </Badge>
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

      {/* 2. Top Leagues Section */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('top-leagues')}
          className="w-full flex items-center justify-between px-3 py-2.5 mb-2 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/40 dark:hover:to-green-800/40 transition-all duration-200 group border border-green-200/50 dark:border-green-700/50"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-900 dark:text-green-100">Top Leagues</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
              {topLeagues.length}
            </Badge>
          </div>
          {collapsedSections.has('top-leagues') ? (
            <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />
          )}
        </button>
        
        {!collapsedSections.has('top-leagues') && (
          <div className="space-y-0.5">
            {topLeagues.map((league) => {
              const fixtureCount = leagueFixtureCounts.get(league.id) ?? 0;
              const isLoadingCount = loadingLeagueCounts.has(league.id);
              const active = pathname?.includes(`/predictions/league/${league.id}/`);
              
              return (
                <div key={league.id} className={`flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${active ? 'bg-accent/60' : ''}`}>
                  <a
                    href={`/predictions/league/${league.id}/${generateLeagueSlug({ name: league.name, id: league.id })}`}
                    className={`flex items-center gap-1.5 flex-1 text-left min-w-0 ${active ? 'text-primary font-medium' : ''}`}
                  >
                    <span className="font-medium text-sm truncate max-w-[100px]" title={`${league.name} (${league.country})`}>
                      {league.name}
                    </span>
                    <Badge variant="outline" className={`text-[9px] px-1 flex-shrink-0 ${active ? 'border-primary text-primary' : ''}`}>
                      {league.short_code}
                    </Badge>
                    {isLoadingCount ? (
                      <div className="h-4 w-6 bg-muted animate-pulse rounded flex-shrink-0" />
                    ) : (
                      <Badge
                        variant="outline"
                        className={`text-[10px] flex-shrink-0 ${
                          fixtureCount > 0
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-muted text-muted-foreground'
                        }`}
                        title={fixtureCount > 0 ? `${fixtureCount} fixtures in next 7 days` : 'No fixtures in next 7 days'}
                      >
                        {fixtureCount}
                      </Badge>
                    )}
                  </a>
                  <a
                    href={`/predictions/league/${league.id}/${generateLeagueSlug({ name: league.name, id: league.id })}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    title="Open predictions page"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Tournaments Section */}
      {tournamentItems.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => toggleSection('tournaments')}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/40 dark:hover:to-purple-800/40 transition-all duration-200 group border border-purple-200/50 dark:border-purple-700/50"
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Tournaments</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                {tournamentItems.length}
              </Badge>
            </div>
            {collapsedSections.has('tournaments') ? (
              <ChevronRight className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
            ) : (
              <ChevronDown className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
            )}
          </button>
          
          {!collapsedSections.has('tournaments') && (
            <div className="space-y-0.5">
            {tournamentItems.map((tournament) => {
              const isExpanded = expandedCountries.has(tournament.id);
              const leagues = countryLeagues.get(tournament.id) || [];
              const isLoadingLeagues = loadingStates.get(tournament.id) || false;
              const tournamentName = tournament.name || tournament.fifa_name || tournament.official_name || '';

              return (
                <div key={tournament.id} className="space-y-0.5" id={`country-${tournament.id}`}>
                  {/* Tournament Header */}
                  <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                    <button
                      onClick={() => toggleCountry(tournament.id)}
                      className="flex items-center gap-1.5 flex-1 text-left min-w-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span 
                        className={`font-medium truncate text-sm max-w-[100px] ${
                          (tournament.leaguesCount || 0) === 0 ? 'text-muted-foreground italic' : ''
                        }`} 
                        title={tournamentName}
                      >
                        {tournamentName}
                      </span>
                      <Badge variant="outline" className="text-[10px] ml-1 flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                        Tournament
                      </Badge>
                      {loadingCounts.has(tournament.id) ? (
                        <div className="ml-1 h-4 w-6 bg-muted animate-pulse rounded flex-shrink-0" />
                      ) : (
                        <Badge
                          variant="outline"
                          className={`text-[10px] ml-1 flex-shrink-0 ${
                            (countryTodayCounts.get(tournament.id) ?? 0) > 0
                              ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                              : 'bg-muted text-muted-foreground'
                          }`}
                          title={(countryTodayCounts.get(tournament.id) ?? 0) > 0 ? `${countryTodayCounts.get(tournament.id)} fixtures today` : 'No fixtures today'}
                        >
                          {countryTodayCounts.get(tournament.id) ?? 0}
                        </Badge>
                      )}
                    </button>
                    
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Favorite Star */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(tournament.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          favorites.has(tournament.id)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-muted-foreground hover:text-yellow-500'
                        }`}
                        title={favorites.has(tournament.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.has(tournament.id) ? (
                          <Star className="h-3 w-3 fill-current" />
                        ) : (
                          <StarOff className="h-3 w-3" />
                        )}
                      </button>
                      <a
                        href={getCountryPredictionsUrl(tournament)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Open predictions page"
                      >
                        <ExternalLink className="h-3 w-3" />
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
                          const active = pathname?.includes(`/predictions/league/${league.id}/`);
                          const fixtureCount = leagueFixtureCounts.get(league.id) ?? 0;
                          const isLoadingCount = loadingLeagueCounts.has(league.id);
                          
                          return (
                            <div key={league.id} className={`flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${active ? 'bg-accent/60' : ''}`}>
                            <a
                              href={`/predictions/league/${league.id}/${generateLeagueSlug({ name: league.name, id: league.id })}`}
                              className={`flex items-center gap-1.5 flex-1 text-xs min-w-0 ${active ? 'text-primary font-medium' : ''}`}
                              title={`League ID: ${league.id}`}
                            >
                                <span className="truncate max-w-[100px]" title={league.name}>{league.name}</span>
                                {league.short_code && (
                                  <Badge variant="outline" className={`text-xs px-1 py-0.5 flex-shrink-0 ${active ? 'border-primary text-primary' : ''}`}>
                                    {league.short_code}
                                  </Badge>
                                )}
                                {isLoadingCount ? (
                                  <div className="h-4 w-6 bg-muted animate-pulse rounded flex-shrink-0" />
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] flex-shrink-0 ${
                                      fixtureCount > 0
                                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                    title={fixtureCount > 0 ? `${fixtureCount} fixtures in next 7 days` : 'No fixtures in next 7 days'}
                                  >
                                    {fixtureCount}
                                  </Badge>
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
          )}
        </div>
      )}
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
