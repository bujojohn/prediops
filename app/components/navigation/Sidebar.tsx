'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  Globe, 
  Search,
  Star,
  Zap,
  Target,
  DollarSign,
  Clock,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCountries, searchCountries } from '@/lib/data/countries';
import { Country } from '@/schemas/country.schema';
import { Badge } from '@/components/ui/badge';
import { getCountryPredictionsUrl, getCountriesWithLeagues } from '@/lib/utils/country-utils';
import { 
  SidebarTheme, 
  SidebarHeader, 
  SidebarSection
} from './SidebarTheme';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [favoriteCountries, setFavoriteCountries] = useState<Set<number>>(new Set());
  const [countryLeagues, setCountryLeagues] = useState<Record<number, unknown[]>>({});
  const [loadingLeagues, setLoadingLeagues] = useState<Set<number>>(new Set());

  // Load countries data with available leagues
  useEffect(() => {
    const loadCountriesWithLeagues = async () => {
      try {
        const countriesWithLeagues = await getCountriesWithLeagues();
        
        if (countriesWithLeagues.length > 0) {
          setAllCountries(countriesWithLeagues);
          setFilteredCountries(countriesWithLeagues.slice(0, 20)); // Show top 20 initially
        } else {
          // If no countries with leagues, fall back to all countries
          const countries = getCountries();
          setAllCountries(countries);
          setFilteredCountries(countries.slice(0, 20));
        }
      } catch (error) {
        console.error('Error loading countries with leagues:', error);
        // Fallback to all countries if API fails
        try {
          const countries = getCountries();
          setAllCountries(countries);
          setFilteredCountries(countries.slice(0, 20));
        } catch (fallbackError) {
          console.error('Error loading fallback countries:', fallbackError);
        }
      }
    };

    // Load immediately with fallback
    const countries = getCountries();
    setAllCountries(countries);
    setFilteredCountries(countries.slice(0, 20));
    
    // Then try to load countries with leagues
    loadCountriesWithLeagues();
  }, []);

  // Filter countries based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchCountries(searchQuery);
      setFilteredCountries(results.slice(0, 15)); // Limit search results
    } else {
      setFilteredCountries(allCountries.slice(0, 20));
    }
  }, [searchQuery, allCountries]);

  const toggleCountry = async (countryId: number) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryId)) {
      newExpanded.delete(countryId);
      setExpandedCountries(newExpanded);
    } else {
      newExpanded.add(countryId);
      setExpandedCountries(newExpanded);
      
      // Load leagues for this country if not already loaded
      if (!countryLeagues[countryId] && !loadingLeagues.has(countryId)) {
        setLoadingLeagues(prev => new Set(prev).add(countryId));
        try {
          const response = await fetch(`/api/sportmonks/leagues/country/${countryId}`);
          const data = await response.json();
          if (data.success) {
            setCountryLeagues(prev => ({
              ...prev,
              [countryId]: data.data || []
            }));
          }
        } catch (error) {
          console.error('Error loading leagues for country:', countryId, error);
        } finally {
          setLoadingLeagues(prev => {
            const newSet = new Set(prev);
            newSet.delete(countryId);
            return newSet;
          });
        }
      }
    }
  };

  const toggleFavorite = (countryId: number) => {
    const newFavorites = new Set(favoriteCountries);
    if (newFavorites.has(countryId)) {
      newFavorites.delete(countryId);
    } else {
      newFavorites.add(countryId);
    }
    setFavoriteCountries(newFavorites);
  };

  // Get favorite countries first
  const sortedCountries = [...filteredCountries].sort((a, b) => {
    const aIsFavorite = favoriteCountries.has(a.id);
    const bIsFavorite = favoriteCountries.has(b.id);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <SidebarTheme className={cn(isCollapsed ? 'w-16' : 'w-80', className)}>
      {/* Header with Search */}
      <SidebarHeader>
        {!isCollapsed && (
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
              <Input
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
              />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </SidebarHeader>

      {/* Quick Actions */}
      {!isCollapsed && (
        <SidebarSection>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-sidebar-foreground" />
            <span className="text-sm font-medium text-sidebar-foreground">Quick Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/predictions">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Target className="h-3 w-3" />
                Predictions
              </Button>
            </Link>
            <Link href="/value-bets">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <DollarSign className="h-3 w-3" />
                Value Bets
              </Button>
            </Link>
            <Link href="/live">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Clock className="h-3 w-3" />
                Live
              </Button>
            </Link>
            <Link href="/countries">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Globe className="h-3 w-3" />
                All Countries
              </Button>
            </Link>
          </div>
        </SidebarSection>
      )}

      {/* Countries List */}
      <div className="flex-1 overflow-y-auto">
        <SidebarSection>
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-sidebar-foreground" />
                <span className="text-sm font-medium text-sidebar-foreground">Countries</span>
              </div>
              <span className="text-xs text-sidebar-foreground/60">
                {filteredCountries.length} of {allCountries.length}
              </span>
            </div>
          )}
          
          <div className="space-y-1">
            {sortedCountries.map((country) => (
              <div key={country.id}>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCountry(country.id)}
                    className={cn(
                      "flex-1 justify-start gap-2 text-sm h-8",
                      "text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    {country.image_path ? (
                      <img 
                        src={country.image_path} 
                        alt={country.name || 'Flag'}
                        className="w-4 h-4 rounded object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-sidebar-accent flex items-center justify-center">
                        <span className="text-xs font-bold text-sidebar-foreground">
                          {country.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                                         {!isCollapsed && (
                       <>
                         <span className="flex-1 text-left truncate">{country.name || 'Unknown'}</span>
                                                   {(() => {
                            const fixtureCount = (country as { fixtureCount?: number }).fixtureCount;
                            return fixtureCount && fixtureCount > 0 ? (
                              <Badge variant="outline" className="ml-2 text-xs px-1 py-0">
                                {fixtureCount}
                              </Badge>
                            ) : null;
                          })()}
                         <ChevronRight 
                           className={cn(
                             "h-3 w-3 transition-transform text-sidebar-foreground",
                             expandedCountries.has(country.id) && "rotate-90"
                           )} 
                         />
                       </>
                     )}
                  </Button>
                  
                  {!isCollapsed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(country.id)}
                      className={cn(
                        "h-8 w-8 p-0",
                        favoriteCountries.has(country.id)
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-sidebar-foreground/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {expandedCountries.has(country.id) && !isCollapsed && (
                  <div className="ml-6 mt-1 mb-2 space-y-1">
                    {/* Loading state */}
                    {loadingLeagues.has(country.id) && (
                      <div className="text-xs text-sidebar-foreground/60 px-2 py-1">
                        Loading leagues...
                      </div>
                    )}
                    
                    {/* Leagues list */}
                    {countryLeagues[country.id] && countryLeagues[country.id].length > 0 && (
                      <>
                                                 {(countryLeagues[country.id] as { id: number; name: string; fixtureCount?: number; active?: boolean }[]).slice(0, 5).map((league) => (
                           <Link 
                             key={league.id} 
                             href={`/predictions/league/${league.id}`}
                           >
                                                         <Button
                               variant="ghost"
                               size="sm"
                               className="w-full justify-start gap-2 text-xs text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
                             >
                               <Trophy className="h-3 w-3" />
                               <span className="truncate">{league.name}</span>
                               <div className="ml-auto flex gap-1">
                                                                   {league.fixtureCount && league.fixtureCount > 0 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {league.fixtureCount}
                                    </Badge>
                                  )}
                                 {league.active && (
                                   <Badge variant="outline" className="text-xs px-1 py-0">
                                     Active
                                   </Badge>
                                 )}
                               </div>
                             </Button>
                          </Link>
                        ))}
                        
                        {/* View all leagues link */}
                        {countryLeagues[country.id].length > 5 && (
                          <Link href={getCountryPredictionsUrl(country)}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 text-xs text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent"
                            >
                              <ChevronRight className="h-3 w-3" />
                              <span>View all {countryLeagues[country.id].length} leagues</span>
                            </Button>
                          </Link>
                        )}
                      </>
                    )}
                    
                    {/* No leagues found */}
                    {countryLeagues[country.id] && countryLeagues[country.id].length === 0 && (
                      <div className="text-xs text-sidebar-foreground/60 px-2 py-1">
                        No leagues found
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isCollapsed && searchQuery && filteredCountries.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-sidebar-foreground/60">No countries found</p>
            </div>
          )}
        </SidebarSection>
      </div>


    </SidebarTheme>
  );
} 