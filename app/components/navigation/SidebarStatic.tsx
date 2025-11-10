'use client';

import React, { useState, useEffect, memo } from 'react';
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
import { usePathname, useSearchParams } from 'next/navigation';
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
  
  const [allCountries, setAllCountries] = useState<CountryWithLeagues[]>([]);
  const [allLeagues, setAllLeagues] = useState<League[]>([]);
  const [allTeams, setAllTeams] = useState<{ id: number; name: string; image_path?: string; country_id?: number }[]>([]);
  const [allFixtures, setAllFixtures] = useState<{ 
    id: number; 
    starting_at: string; 
    participants: { id: number; name: string }[]; 
    league: { id: number; name: string; country_id?: number } 
  }[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load all search data
  useEffect(() => {
    const loadSearchData = async () => {
      if (debouncedSearchTerm.trim().length < 2) return; // Only search with 2+ characters
      
      setIsLoading(true);
      try {
        // Load all data in parallel
        const [countriesRes, leaguesRes, teamsRes, fixturesRes] = await Promise.all([
          fetch('/api/sportmonks/countries/with-leagues'),
          fetch('/api/sportmonks/leagues?per_page=100&page=1'),
          fetch('/api/sportmonks/teams?per_page=100&page=1'),
          fetch(`/api/sportmonks/fixtures/upcoming?per_page=50&page=1`)
        ]);

        const [countriesData, leaguesData, teamsData, fixturesData] = await Promise.all([
          countriesRes.json(),
          leaguesRes.json(),
          teamsRes.json(),
          fixturesRes.json()
        ]);

        if (countriesData.success) {
          setAllCountries(countriesData.data || []);
        }
        
        if (leaguesData.success) {
          setAllLeagues(leaguesData.data || []);
        }
        
        if (teamsData.success) {
          setAllTeams(teamsData.data || []);
        }
        
        if (fixturesData.success) {
          setAllFixtures(fixturesData.data || []);
        }
      } catch (error) {
        console.error('Error loading search data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSearchData();
  }, [debouncedSearchTerm]);

  // Enhanced search functionality
  useEffect(() => {
    if (!debouncedSearchTerm.trim() || debouncedSearchTerm.trim().length < 2) {
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

    const searchLower = debouncedSearchTerm.toLowerCase();
    const results = {
      countries: [] as CountryWithLeagues[],
      leagues: [] as { country: CountryWithLeagues; league: League }[],
      teams: [] as { country: CountryWithLeagues; team: { id: number; name: string; image_path?: string } }[],
      tournaments: [] as CountryWithLeagues[],
      fixtures: [] as { 
        fixture: { 
          id: number; 
          starting_at: string; 
          participants: { id: number; name: string }[]; 
          league: { id: number; name: string } 
        }; 
        country: CountryWithLeagues 
      }[],
      hasResults: false
    };

    // Search countries
    const matchingCountries = allCountries.filter((country) => {
      const name = (country.name || country.fifa_name || country.official_name || '').toLowerCase();
      return name.includes(searchLower);
    });
    
    results.countries = matchingCountries;

    // Search leagues
    const matchingLeagues = allLeagues.filter(league => 
      league.name.toLowerCase().includes(searchLower) ||
      (league.short_code && league.short_code.toLowerCase().includes(searchLower))
    );
    
    matchingLeagues.forEach(league => {
      const country = allCountries.find(c => c.id === league.country_id);
      if (country) {
        results.leagues.push({ country, league });
      }
    });

    // Search teams
    const matchingTeams = allTeams.filter(team => 
      team.name.toLowerCase().includes(searchLower)
    );
    
    matchingTeams.forEach(team => {
      const country = allCountries.find(c => c.id === team.country_id);
      if (country) {
        results.teams.push({ country, team });
      }
    });

    // Search tournaments (countries that are tournaments)
    const matchingTournaments = allCountries.filter((country) => {
      const name = (country.name || country.fifa_name || country.official_name || '').toLowerCase();
      if (!name.includes(searchLower)) return false;
      
      // Check if it's a tournament
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

    // Search fixtures
    const matchingFixtures = allFixtures.filter(fixture => {
      const homeTeam = fixture.participants[0]?.name?.toLowerCase() || '';
      const awayTeam = fixture.participants[1]?.name?.toLowerCase() || '';
      const leagueName = fixture.league?.name?.toLowerCase() || '';
      
      return homeTeam.includes(searchLower) || 
             awayTeam.includes(searchLower) || 
             leagueName.includes(searchLower);
    });
    
    matchingFixtures.forEach(fixture => {
      const country = allCountries.find(c => c.id === fixture.league.country_id);
      if (country) {
        results.fixtures.push({ fixture, country });
      }
    });

    results.hasResults = results.countries.length > 0 || 
                        results.leagues.length > 0 || 
                        results.teams.length > 0 ||
                        results.tournaments.length > 0 ||
                        results.fixtures.length > 0;
    
    setSearchResults(results);
  }, [debouncedSearchTerm, allCountries, allLeagues, allTeams, allFixtures]);

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
                    href={`/predictions/league/${generateLeagueSlug({ name: item.fixture.league.name, id: item.fixture.league.id })}?id=${item.fixture.league.id}`}
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
                    href={`/predictions/league/${generateLeagueSlug({ name: item.league.name, id: item.league.id })}?id=${item.league.id}`}
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
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
                title="Refresh data"
                onClick={() => {
                  // Refresh sidebar data
                  window.location.reload();
                }}
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Refresh</span>
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
  showTodayOnly 
}: { 
  searchTerm: string;
  showFavoritesOnly: boolean;
  showActiveOnly: boolean;
  showTodayOnly: boolean;
}) {
  const [allCountries, setAllCountries] = useState<CountryWithLeagues[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryWithLeagues[]>([]);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [countryLeagues, setCountryLeagues] = useState<Map<number, League[]>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<number, boolean>>(new Map());
  const [isLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
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
  
  // Section collapse state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
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

  // Define top leagues data - using country IDs for now, will be replaced with actual league IDs from API
  const topLeagues = React.useMemo(() => [
    { name: 'Premier League', country: 'England', short_code: 'EPL', countryId: 462 },
    { name: 'La Liga', country: 'Spain', short_code: 'LL', countryId: 32 },
    { name: 'Serie A', country: 'Italy', short_code: 'SA', countryId: 251 },
    { name: 'Bundesliga', country: 'Germany', short_code: 'BL', countryId: 11 },
    { name: 'Ligue 1', country: 'France', short_code: 'L1', countryId: 17 },
    { name: 'Championship', country: 'England', short_code: 'CH', countryId: 462 },
    { name: 'Eredivisie', country: 'Netherlands', short_code: 'ED', countryId: 38 },
    { name: 'Primeira Liga', country: 'Portugal', short_code: 'PL', countryId: 20 },
  ], []);

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
  }, [countryLeagues]);

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
          <div className="space-y-0.5 max-h-[calc(100vh/3)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {countryItems.map((country) => {
            const isExpanded = expandedCountries.has(country.id);
            const leagues = countryLeagues.get(country.id) || [];
            const isLoadingLeagues = loadingStates.get(country.id) || false;
            const countryName = country.name || country.fifa_name || country.official_name || '';

            return (
              <div key={country.id} className="space-y-0.5" id={`country-${country.id}`}>
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
                        const active = pathname?.startsWith('/predictions/league') && searchParams?.get('id') === String(league.id);
                        return (
                          <div key={league.id} className={`flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${active ? 'bg-accent/60' : ''}`}>
                            <a
                              href={`/predictions/league/${generateLeagueSlug({ name: league.name, id: league.id })}?id=${league.id}`}
                              className={`flex items-center gap-1.5 flex-1 text-xs min-w-0 ${active ? 'text-primary font-medium' : ''}`}
                              title={`League ID: ${league.id}`}
                            >
                              <span className="truncate max-w-[100px]" title={league.name}>{league.name}</span>
                              {league.short_code && (
                                <Badge variant="outline" className={`text-xs px-1 py-0.5 flex-shrink-0 ${active ? 'border-primary text-primary' : ''}`}>
                                  {league.short_code}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className="text-[10px] flex-shrink-0 bg-muted text-muted-foreground"
                              >
                                0
                              </Badge>
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
            {topLeagues.map((league, index) => (
              <div key={`top-league-${index}`} className="flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                <a
                  href={`/predictions/country/${league.country.toLowerCase().replace(/\s+/g, '-')}/?id=${league.countryId}`}
                  className="flex items-center gap-1.5 flex-1 text-left min-w-0"
                >
                  <span className="font-medium text-sm truncate max-w-[120px]" title={`${league.name} (${league.country})`}>
                    {league.name}
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1 flex-shrink-0">
                    {league.short_code}
                  </Badge>
                </a>
                <a
                  href={`/predictions/country/${league.country.toLowerCase().replace(/\s+/g, '-')}/?id=${league.countryId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  title="Open predictions page"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
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
                          const active = pathname?.startsWith('/predictions/league') && searchParams?.get('id') === String(league.id);
                          return (
                            <div key={league.id} className={`flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${active ? 'bg-accent/60' : ''}`}>
                            <a
                              href={`/predictions/league/${generateLeagueSlug({ name: league.name, id: league.id })}?id=${league.id}`}
                              className={`flex items-center gap-1.5 flex-1 text-xs min-w-0 ${active ? 'text-primary font-medium' : ''}`}
                              title={`League ID: ${league.id}`}
                            >
                                <span className="truncate max-w-[100px]" title={league.name}>{league.name}</span>
                                {league.short_code && (
                                  <Badge variant="outline" className={`text-xs px-1 py-0.5 flex-shrink-0 ${active ? 'border-primary text-primary' : ''}`}>
                                    {league.short_code}
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className="text-[10px] flex-shrink-0 bg-muted text-muted-foreground"
                                >
                                  0
                                </Badge>
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
