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
  Globe
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

// Static shell that can be prerendered with full functionality
export const SidebarStatic = memo(function SidebarStatic() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [searchTerm, setSearchTerm] = useState('');
  
  if (isHomePage) {
    return null;
  }

  return (
    <SidebarTheme>
      <div className="flex flex-col h-full">
        {/* Header with Search */}
        <div className="p-3 border-b">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search countries, leagues..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Controls Row */}
          <div className="flex items-center gap-2 mb-3">
            <button
              className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors text-muted-foreground hover:text-foreground"
              title="Show only favorites"
            >
              <Star className="h-3 w-3" />
              <span>Favorites</span>
            </button>
            
          </div>
        </div>

        {/* Dynamic Content Area - This will stream in */}
        <div className="flex-1 overflow-auto">
          <SidebarContent searchTerm={searchTerm} />
        </div>
      </div>
    </SidebarTheme>
  );
});

// Dynamic content that loads the actual sidebar data with full functionality
function SidebarContent({ searchTerm }: { searchTerm: string }) {
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
      const response = await fetch(`/api/sportmonks/fixtures/country/${countryId}?date=${today}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const count = data.data.length || 0;
        setCountryTodayCounts(prev => new Map(prev).set(countryId, count));
      } else {
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
    // Load counts for first 10 countries to avoid performance issues
    const visibleCountries = filteredCountries.slice(0, 10);
    visibleCountries.forEach(country => {
      if (country.leaguesCount > 0) {
        loadTodayFixtureCounts(country.id);
      }
    });
  }, [filteredCountries, loadTodayFixtureCounts]);

  // Enhanced search functionality - countries, leagues, and teams
  const [searchResults, setSearchResults] = useState<{
    countries: CountryWithLeagues[];
    leagues: { country: CountryWithLeagues; league: League }[];
    teams: { country: CountryWithLeagues; team: { id: number; name: string } }[];
    hasResults: boolean;
  }>({ countries: [], leagues: [], teams: [], hasResults: false });

  // Debounced search to improve performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter countries and leagues based on search term
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setFilteredCountries(allCountries);
      setSearchResults({ countries: [], leagues: [], teams: [], hasResults: false });
      return;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    const searchResults = {
      countries: [] as CountryWithLeagues[],
      leagues: [] as { country: CountryWithLeagues; league: League }[],
      teams: [] as { country: CountryWithLeagues; team: { id: number; name: string } }[],
      hasResults: false
    };

    // Search countries
    const matchingCountries = allCountries.filter((country) => {
      const name = (country.name || country.fifa_name || country.official_name || '').toLowerCase();
      return name.includes(searchLower);
    });
    
    searchResults.countries = matchingCountries;

    // Search leagues (only in expanded countries to avoid performance issues)
    for (const [countryId, leagues] of countryLeagues.entries()) {
      const country = allCountries.find(c => c.id === countryId);
      if (country) {
        const matchingLeagues = leagues.filter(league => 
          league.name.toLowerCase().includes(searchLower) ||
          (league.short_code && league.short_code.toLowerCase().includes(searchLower))
        );
        
        matchingLeagues.forEach(league => {
          searchResults.leagues.push({ country, league });
        });
      }
    }

    searchResults.hasResults = searchResults.countries.length > 0 || searchResults.leagues.length > 0 || searchResults.teams.length > 0;
    
    setFilteredCountries(matchingCountries);
    setSearchResults(searchResults);
  }, [debouncedSearchTerm, allCountries, countryLeagues]);

  // Show skeleton while data is loading
  if (isLoading || allCountries.length === 0) {
    return <SidebarContentSkeleton />;
  }

  return (
    <div className="p-1">
      
      {/* Search Results Display - Compact and Integrated */}
      {searchResults.hasResults && debouncedSearchTerm.trim() && (
        <div className="mb-3 p-2 rounded-md bg-primary/5 border border-primary/20">
          <div className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
            <Search className="h-3 w-3" />
            Results for &ldquo;{debouncedSearchTerm}&rdquo;
          </div>
          <div className="space-y-2">
            {searchResults.countries.length > 0 && (
              <div>
                <div className="text-[10px] font-medium text-muted-foreground mb-1">
                  Countries ({searchResults.countries.length})
                </div>
                <div className="space-y-0.5">
                  {searchResults.countries.slice(0, 2).map((country) => (
                    <div key={country.id} className="flex items-center gap-1 text-xs p-1 rounded hover:bg-accent transition-colors">
                      <span className="truncate flex-1">{country.name || country.fifa_name}</span>
                      <Badge variant="outline" className="text-[9px] px-1 flex-shrink-0">
                        {country.leaguesCount || 0}
                      </Badge>
                    </div>
                  ))}
                  {searchResults.countries.length > 2 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{searchResults.countries.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )}
            {searchResults.leagues.length > 0 && (
              <div>
                <div className="text-[10px] font-medium text-muted-foreground mb-1">
                  Leagues ({searchResults.leagues.length})
                </div>
                <div className="space-y-0.5">
                  {searchResults.leagues.slice(0, 2).map((item, index) => (
                    <a
                      key={`${item.country.id}-${item.league.id}-${index}`}
                      href={`/predictions/league/${generateLeagueSlug({ name: item.league.name, id: item.league.id })}/?id=${item.league.id}`}
                      className="flex items-center gap-1 text-xs p-1 rounded hover:bg-accent transition-colors"
                    >
                      <span className="truncate flex-1">{item.league.name}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">({item.country.name})</span>
                    </a>
                  ))}
                  {searchResults.leagues.length > 2 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{searchResults.leagues.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )}
            {searchResults.teams.length > 0 && (
              <div>
                <div className="text-[10px] font-medium text-muted-foreground mb-1">
                  Teams ({searchResults.teams.length})
                </div>
                <div className="space-y-0.5">
                  {searchResults.teams.slice(0, 2).map((item, index) => (
                    <a
                      key={`${item.country.id}-${item.team.id}-${index}`}
                      href={`/team/${item.team.id}/${item.team.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center gap-1 text-xs p-1 rounded hover:bg-accent transition-colors"
                    >
                      <span className="truncate flex-1">{item.team.name}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">({item.country.name})</span>
                    </a>
                  ))}
                  {searchResults.teams.length > 2 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{searchResults.teams.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 1. Top Leagues Section */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('top-leagues')}
          className="w-full flex items-center justify-between px-2 py-2 mb-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Top Leagues</span>
          </div>
          {collapsedSections.has('top-leagues') ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
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

      {/* 2. Countries Section */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('countries')}
          className="w-full flex items-center justify-between px-2 py-2 mb-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Countries</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              {countryItems.length}
            </Badge>
          </div>
          {collapsedSections.has('countries') ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </button>
        
        {!collapsedSections.has('countries') && (
          <div className="space-y-0.5">
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

      {/* 3. Tournaments Section */}
      {tournamentItems.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => toggleSection('tournaments')}
            className="w-full flex items-center justify-between px-2 py-2 mb-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Tournaments</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                {tournamentItems.length}
              </Badge>
            </div>
            {collapsedSections.has('tournaments') ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
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
