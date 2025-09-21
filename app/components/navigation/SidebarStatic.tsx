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
              placeholder="Search countries..."
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
  
  // Favorites and filtering state
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  // Today fixture counts
  const [countryTodayCounts] = useState<Map<number, number>>(new Map());
  const [leagueTodayCounts] = useState<Map<number, number>>(new Map());

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

  // Load countries on mount
  useEffect(() => {
    loadCountriesWithLeagues();
  }, []);

  // Filter countries based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCountries(allCountries);
      return;
    }

    const filtered = allCountries.filter((country) => {
      const name = (country.name || country.fifa_name || country.official_name || '').toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });

    setFilteredCountries(filtered);
  }, [searchTerm, allCountries]);

  // Show skeleton while data is loading
  if (isLoading || allCountries.length === 0) {
    return <SidebarContentSkeleton />;
  }

  return (
    <div className="p-1">
      
      {/* 1. Top Leagues Section */}
      <div className="mb-3">
        <div className="px-1 py-1 text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1 mb-2">
          <Star className="h-3 w-3" />
          Top Leagues
        </div>
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
      </div>

      {/* 2. Countries Section */}
      <div className="mb-3">
        <div className="px-1 py-1 text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1 mb-2">
          <Globe className="h-3 w-3" />
          Countries ({countryItems.length})
        </div>
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
                    <Badge
                      variant="outline"
                      className={`text-[10px] ml-1 flex-shrink-0 ${
                        countryTodayCounts.get(country.id) ?? 0 > 0
                          ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {countryTodayCounts.get(country.id) ?? 0}
                    </Badge>
                  </button>
                  
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Favorite Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFavorites(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(country.id)) {
                            newSet.delete(country.id);
                          } else {
                            newSet.add(country.id);
                          }
                          return newSet;
                        });
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
                              href={`/predictions/league/${generateLeagueSlug({ name: league.name })}?id=${league.id}`}
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
                                className={`text-[10px] flex-shrink-0 transition-opacity duration-300 ${
                                  leagueTodayCounts.get(league.id) ?? 0 > 0
                                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {leagueTodayCounts.get(league.id) ?? 0}
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
      </div>

      {/* 3. Tournaments Section */}
      {tournamentItems.length > 0 && (
        <div>
          <div className="px-1 py-1 text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1 mb-2">
            <Globe className="h-3 w-3" />
            Tournaments ({tournamentItems.length})
          </div>
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
                      <Badge
                        variant="outline"
                        className={`text-[10px] ml-1 flex-shrink-0 ${
                          countryTodayCounts.get(tournament.id) ?? 0 > 0
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {countryTodayCounts.get(tournament.id) ?? 0}
                      </Badge>
                    </button>
                    
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Favorite Star */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavorites(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(tournament.id)) {
                              newSet.delete(tournament.id);
                            } else {
                              newSet.add(tournament.id);
                            }
                            return newSet;
                          });
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
                                href={`/predictions/league/${generateLeagueSlug({ name: league.name })}?id=${league.id}`}
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
                                  className={`text-[10px] flex-shrink-0 transition-opacity duration-300 ${
                                    leagueTodayCounts.get(league.id) ?? 0 > 0
                                      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {leagueTodayCounts.get(league.id) ?? 0}
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
