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
  Info,
  Star,
  StarOff,
  SortAsc,
  SortDesc,
  RefreshCw,
  Settings
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
  
  // Favorites and filtering state
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'fixtures' | 'leagues'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Filter and sort countries based on search term, favorites, and sort settings
  useEffect(() => {
    let filtered = allCountries;
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(country => 
        country.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.fifa_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.official_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by favorites if enabled
    if (showOnlyFavorites) {
      filtered = filtered.filter(country => favorites.has(country.id));
    }
    
    // Sort countries based on current sort settings
    const sortedCountries = filtered.sort(getSortFunction);
    
    setFilteredCountries(sortedCountries);
  }, [searchTerm, allCountries, showOnlyFavorites, favorites, sortBy, sortOrder]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('sidebar-favorites');
      if (savedFavorites) {
        const favoritesArray = JSON.parse(savedFavorites);
        setFavorites(new Set(favoritesArray));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

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
    setCountryLeagues(new Map()); // Clear cached leagues
    setExpandedCountries(new Set()); // Collapse all countries
    await loadCountriesWithLeagues();
    setIsRefreshing(false);
  };

  // Get sort function based on current sort settings
  const getSortFunction = (a: CountryWithLeagues, b: CountryWithLeagues) => {
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
  };

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
            <span>{filteredCountries.length} countries</span>
            {showOnlyFavorites && (
              <Badge variant="outline" className="text-xs">
                {favorites.size} favorites
              </Badge>
            )}
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
          <div className="p-1 space-y-0.5">
            {filteredCountries.map((country) => {
              const isExpanded = expandedCountries.has(country.id);
              const leagues = countryLeagues.get(country.id) || [];
              const isLoadingLeagues = loadingStates.get(country.id) || false;

                             return (
                 <div key={country.id} className="space-y-0.5">
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
                      <span className="font-medium truncate text-sm">
                        {country.name || country.fifa_name || country.official_name}
                      </span>
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
                      
                      {country.fixtureCount > 0 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          <Calendar className="h-2.5 w-2.5 mr-0.5" />
                          {country.fixtureCount}
                        </Badge>
                      )}
                      {country.leaguesCount > 0 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          <Trophy className="h-2.5 w-2.5 mr-0.5" />
                          {country.leaguesCount}
                        </Badge>
                      )}
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
                          console.log(`Sidebar: League ${league.name} (ID: ${league.id}, Active: ${league.active})`);
                          return (
                            <div key={league.id} className="flex items-center justify-between p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                              <a
                                href={`${getCountryPredictionsUrl(country)}&league=${league.id}`}
                                className="flex items-center gap-1.5 flex-1 text-xs"
                                title={`League ID: ${league.id}`}
                              >
                                <Trophy className="h-2.5 w-2.5 text-muted-foreground" />
                                <span className="truncate">{league.name}</span>
                                {league.short_code && (
                                  <Badge variant="outline" className="text-xs px-1 py-0.5">
                                    {league.short_code}
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

        {/* Footer */}
        <div className="p-3 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-3 w-3" />
              <span>Powered by SportMonks API</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <span>Data refreshes every 5 minutes</span>
              {favorites.size > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{favorites.size} favorites</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarTheme>
  );
} 