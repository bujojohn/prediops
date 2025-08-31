'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Globe, 
  Trophy, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Calendar,
  Users,
  Info
} from 'lucide-react';
import { SidebarTheme } from './SidebarTheme';
import { getCountryPredictionsUrl } from '@/lib/utils/country-utils';
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

export default function Sidebar() {
  const [allCountries, setAllCountries] = useState<CountryWithLeagues[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryWithLeagues[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [countryLeagues, setCountryLeagues] = useState<Map<number, League[]>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<number, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Load countries with leagues using API route
  const loadCountriesWithLeagues = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sportmonks/countries/with-leagues');
      const data = await response.json();
      
      if (data.success) {
        const countries = data.data || [];
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
    } finally {
      setIsLoading(false);
    }
  };

  // Load leagues for a specific country using API route
  const loadCountryLeagues = async (countryId: number) => {
    if (countryLeagues.has(countryId)) {
      return; // Already loaded
    }

    setLoadingStates(prev => new Map(prev).set(countryId, true));
    
    try {
      const response = await fetch(`/api/sportmonks/leagues/country/${countryId}`);
      const data = await response.json();
      
      if (data.success) {
        const leagues = data.data || [];
        setCountryLeagues(prev => new Map(prev).set(countryId, leagues));
      } else {
        setCountryLeagues(prev => new Map(prev).set(countryId, []));
      }
    } catch (error) {
      console.error(`Error loading leagues for country ${countryId}:`, error);
      setCountryLeagues(prev => new Map(prev).set(countryId, []));
    } finally {
      setLoadingStates(prev => new Map(prev).set(countryId, false));
    }
  };

  // Toggle country expansion with accordion behavior (only one country expanded at a time)
  const toggleCountry = (countryId: number) => {
    const newExpanded = new Set<number>();
    
    if (expandedCountries.has(countryId)) {
      // If clicking on already expanded country, collapse it
      // Don't add anything to newExpanded (empty set)
    } else {
      // If clicking on collapsed country, expand it and collapse others
      newExpanded.add(countryId);
      // Load leagues when expanding
      loadCountryLeagues(countryId);
    }
    
    setExpandedCountries(newExpanded);
  };

  // Filter and sort countries based on search term
  useEffect(() => {
    let filtered = allCountries;
    
    if (searchTerm.trim()) {
      filtered = allCountries.filter(country => 
        country.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.fifa_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.official_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort countries alphabetically by name
    const sortedCountries = filtered.sort((a, b) => {
      const nameA = (a.name || a.fifa_name || a.official_name || '').toLowerCase();
      const nameB = (b.name || b.fifa_name || b.official_name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    setFilteredCountries(sortedCountries);
  }, [searchTerm, allCountries]);

  // Load countries on mount
  useEffect(() => {
    loadCountriesWithLeagues();
  }, []);

  if (isLoading) {
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
        <div className="p-4 border-b">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>{filteredCountries.length} countries</span>
            <div className="flex items-center gap-1 text-xs opacity-75" title="Only one country can be expanded at a time">
              <Info className="h-3 w-3" />
              <span>accordion</span>
            </div>
            {allCountries.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {allCountries.filter(c => c.fixtureCount > 0).length} active
              </Badge>
            )}
          </div>
        </div>

        {/* Countries List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {filteredCountries.map((country) => {
              const isExpanded = expandedCountries.has(country.id);
              const leagues = countryLeagues.get(country.id) || [];
              const isLoadingLeagues = loadingStates.get(country.id) || false;

              return (
                <div key={country.id} className="space-y-1">
                  {/* Country Header */}
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                    <button
                      onClick={() => toggleCountry(country.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium truncate">
                        {country.name || country.fifa_name || country.official_name}
                      </span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {country.fixtureCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {country.fixtureCount}
                        </Badge>
                      )}
                      {country.leaguesCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          {country.leaguesCount}
                        </Badge>
                      )}
                      <a
                        href={getCountryPredictionsUrl(country)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="View all leagues"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {/* Leagues List */}
                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {isLoadingLeagues ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Loading leagues...
                        </div>
                      ) : leagues.length > 0 ? (
                        leagues.map((league) => {
                          console.log(`Sidebar: League ${league.name} (ID: ${league.id}, Active: ${league.active})`);
                          return (
                            <div key={league.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                              <a
                                href={`${getCountryPredictionsUrl(country)}&league=${league.id}`}
                                className="flex items-center gap-2 flex-1 text-sm"
                                title={`League ID: ${league.id}`}
                              >
                                <Trophy className="h-3 w-3 text-muted-foreground" />
                                <span className="truncate">{league.name}</span>
                                {league.short_code && (
                                  <Badge variant="outline" className="text-xs">
                                    {league.short_code}
                                  </Badge>
                                )}
                              </a>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
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

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-3 w-3" />
              <span>Powered by SportMonks API</span>
            </div>
            <div className="text-xs">
              Data refreshes every 5 minutes
            </div>
          </div>
        </div>
      </div>
    </SidebarTheme>
  );
} 