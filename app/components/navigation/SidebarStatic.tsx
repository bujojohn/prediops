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
  StarOff
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

  const isRegion = React.useCallback((country: CountryWithLeagues) => {
    const name = (country.name || country.fifa_name || country.official_name || '').trim().toLowerCase();
    if (!name) return false;
    const regions = new Set([
      'africa', 'europe', 'asia', 'north america', 'south america', 'oceania', 'antarctica', 'world', 'international'
    ]);
    if (regions.has(name)) return true;
    // Also treat aggregated scopes like "uefa", "caf" etc. as regions if present in short_code/fifa_name
    const code = (country.fifa_name || country.official_name || '').trim().toLowerCase();
    const orgs = ['uefa', 'caf', 'afc', 'conmebol', 'concacaf', 'ofc', 'fifa'];
    return orgs.some(org => name.includes(org) || code.includes(org));
  }, []);

  // Split filtered list into countries and regions
  const { countryItems } = React.useMemo(() => {
    const countries: CountryWithLeagues[] = [];
    const regions: CountryWithLeagues[] = [];
    for (const c of filteredCountries) {
      if (isRegion(c)) regions.push(c); else countries.push(c);
    }
    return { countryItems: countries };
  }, [filteredCountries, isRegion]);

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
      {/* Countries Section */}
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
                  <span className={`font-medium truncate text-sm ${
                    (country.leaguesCount || 0) === 0 ? 'text-muted-foreground italic' : ''
                  }`}>
                    {country.name || country.fifa_name || country.official_name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ml-1 transition-opacity duration-300 ${
                      countryTodayCounts.get(country.id) ?? 0 > 0
                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {countryTodayCounts.get(country.id) ?? 0}
                  </Badge>
                </button>
                
                <div className="flex items-center gap-1.5">
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
                            <Badge
                              variant="outline"
                              className={`text-[10px] transition-opacity duration-300 ${
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
