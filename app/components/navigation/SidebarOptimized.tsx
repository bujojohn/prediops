'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { RefreshCw, Calendar, Eye, Star } from 'lucide-react';
import { SidebarTheme } from './SidebarTheme';
import { Logo } from '@/components/ui/Logo';

// Import modular components
import { EnhancedSearchInput } from './sidebar/EnhancedSearchInput';
import { ServerSideSearchResults } from './sidebar/ServerSideSearchResults';
import { CountriesSection } from './sidebar/CountriesSection';
import { TopLeaguesSection } from './sidebar/TopLeaguesSection';
import { TournamentsSection } from './sidebar/TournamentsSection';

// Import custom hooks
import { useFavorites } from './sidebar/hooks/useFavorites';
import { useRecentSearches } from './sidebar/hooks/useRecentSearches';
import { useKeyboardShortcuts } from './sidebar/hooks/useKeyboardShortcuts';
import { useSorting } from './sidebar/hooks/useSorting';
import { useCountriesQuery } from '@/app/hooks/useSidebarQueries';
import { useServerSideLeagues } from '@/app/hooks/useServerSideLeagues';
import { SearchScope } from './sidebar/SearchScopeDropdown';


interface SidebarOptimizedProps {
  showLogo?: boolean;
  onRefreshStateChange?: (isRefreshing: boolean) => void;
}

/**
 * Optimized sidebar component that uses local data directly
 * No API calls, instant loading, follows SportMonks best practices
 */
export function SidebarOptimized({ 
  showLogo = false, 
  onRefreshStateChange 
}: SidebarOptimizedProps) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['tournaments']));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks
  const { favorites, toggleFavorite } = useFavorites();
  const { recentSearches, addToRecentSearches, clearRecentSearches } = useRecentSearches();
  const { sortCountries } = useSorting();

  // Load local countries data from the optimized API endpoint
  // This endpoint reads from data/countries.json with 30-day caching
  const { 
    data: allCountries = []
  } = useCountriesQuery();

  // Load all leagues server-side with 24-hour caching
  const { 
    data: leaguesByCountry = {}
  } = useServerSideLeagues();


  // Identify continents (tournaments) and regular countries
  const KNOWN_TOURNAMENTS = useMemo(() => new Set([
    41, // Europe
    147, // Africa
    11240938, // World Cup
    11240939, // Champions League
    11240940, // Europa League
  ]), []);

  // Enhance countries with league data and filter/sort
  const { filteredAndSortedCountries, tournaments } = useMemo(() => {
    // Enhance countries with league data from server-side preloading
    const enhancedCountries = allCountries.map(country => ({
      ...country,
      leagues: leaguesByCountry[country.id] || [],
      leaguesCount: (leaguesByCountry[country.id] || []).length,
      fixtureCount: 0 // Set to 0 as counting features are removed
    }));

    // Separate tournaments (continents) from regular countries
    const tournaments = enhancedCountries.filter(country => KNOWN_TOURNAMENTS.has(country.id));
    const regularCountries = enhancedCountries.filter(country => !KNOWN_TOURNAMENTS.has(country.id) && country.leaguesCount > 0);

    // Apply search filter
    let filteredCountries = regularCountries;
    let filteredTournaments = tournaments;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredCountries = filteredCountries.filter((country) => {
        const name = (country.name || '').toLowerCase();
        return name.includes(term);
      });
      filteredTournaments = filteredTournaments.filter((tournament) => {
        const name = (tournament.name || '').toLowerCase();
        return name.includes(term);
      });
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filteredCountries = filteredCountries.filter((country) => favorites.has(country.id));
      filteredTournaments = filteredTournaments.filter((tournament) => favorites.has(tournament.id));
    }

    // Apply active leagues filter
    if (showActiveOnly) {
      filteredCountries = filteredCountries.filter((country) => country.leaguesCount > 0);
      filteredTournaments = filteredTournaments.filter((tournament) => tournament.leaguesCount > 0);
    }

    // Apply today's fixtures filter - simplified without counting
    if (showTodayOnly) {
      filteredCountries = filteredCountries.filter((country) => country.leagues && country.leagues.length > 0);
      filteredTournaments = filteredTournaments.filter((tournament) => tournament.leagues && tournament.leagues.length > 0);
    }

    // Apply sorting - simplified without counting
    const sortedCountries = sortCountries(filteredCountries, new Map(), favorites);
    const sortedTournaments = sortCountries(filteredTournaments, new Map(), favorites);

    return {
      filteredAndSortedCountries: sortedCountries,
      tournaments: sortedTournaments
    };
  }, [searchTerm, allCountries, leaguesByCountry, KNOWN_TOURNAMENTS, showFavoritesOnly, showActiveOnly, showTodayOnly, favorites, sortCountries]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    searchInputRef,
    onToggleFavorites: () => setShowFavoritesOnly(prev => !prev),
    onToggleActive: () => setShowActiveOnly(prev => !prev),
    onToggleToday: () => setShowTodayOnly(prev => !prev),
  });

  // Handle search
  const handleSearch = useCallback((term: string) => {
    console.log('SidebarOptimized: handleSearch called with:', term);
    setSearchTerm(term);
    if (term.trim()) {
      addToRecentSearches(term);
    }
  }, [addToRecentSearches]);

  // Handle search scope change
  const handleSearchScopeChange = useCallback((scope: SearchScope) => {
    setSearchScope(scope);
  }, []);

  // Handle recent search click
  const handleRecentSearchClick = useCallback((search: string) => {
    console.log('SidebarOptimized: Recent search clicked:', search);
    setSearchTerm(search);
    addToRecentSearches(search);
    // Trigger the search with the selected term
    handleSearch(search);
  }, [addToRecentSearches, handleSearch]);

  // Handle refresh - simplified without counting
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    onRefreshStateChange?.(true);
    
    try {
      // For local data, we don't need to refresh anything
      // Just simulate a brief delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
      onRefreshStateChange?.(false);
    }
  }, [onRefreshStateChange]);

  // Handle country toggle - simplified without counting
  const handleCountryToggle = useCallback((countryId: number) => {
    setExpandedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(countryId)) {
        newSet.delete(countryId);
      } else {
        newSet.add(countryId);
      }
      return newSet;
    });
  }, []);

  // Handle section toggle
  const handleSectionToggle = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);


  // Show search results if searching
  if (searchTerm.trim()) {
    return (
      <SidebarTheme>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {showLogo && (
              <div className="mb-4">
                <Logo size="sm" showText={true} />
              </div>
            )}
            
            {/* Enhanced Search */}
            <div className="relative">
              <EnhancedSearchInput
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                onScopeChange={handleSearchScopeChange}
                searchScope={searchScope}
                placeholder="Search"
                recentSearches={recentSearches}
                onRecentSearchClick={handleRecentSearchClick}
                onClearRecentSearches={clearRecentSearches}
                showRecentSearches={true}
              />
              {/* Search Results positioned relative to input */}
              <ServerSideSearchResults searchTerm={searchTerm} searchScope={searchScope} />
            </div>
          </div>

          {/* Server-Side Search Results */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="text-sm">Search results will appear above</div>
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {showLogo && (
            <div className="mb-4">
              <Logo size="sm" showText={true} />
            </div>
          )}
          
          {/* Enhanced Search */}
          <div className="relative mb-4">
            <EnhancedSearchInput
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              onScopeChange={handleSearchScopeChange}
              searchScope={searchScope}
              placeholder="Search"
              recentSearches={recentSearches}
              onRecentSearchClick={handleRecentSearchClick}
              onClearRecentSearches={clearRecentSearches}
              showRecentSearches={true}
            />
            {/* Search Results positioned relative to input */}
            <ServerSideSearchResults searchTerm={searchTerm} searchScope={searchScope} />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                  showFavoritesOnly 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Star className="h-3 w-3" />
                Favorites
              </button>
              <button
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                  showActiveOnly 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Eye className="h-3 w-3" />
                Active
              </button>
              <button
                onClick={() => setShowTodayOnly(!showTodayOnly)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                  showTodayOnly 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Calendar className="h-3 w-3" />
                Today
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto scrollbar-thick">
          <div className="p-1">
            {/* Top Leagues Section */}
            <TopLeaguesSection
              isCollapsed={collapsedSections.has('top-leagues')}
              onToggle={() => handleSectionToggle('top-leagues')}
            />

            {/* Countries Section */}
            <CountriesSection
              countries={filteredAndSortedCountries}
              isCollapsed={collapsedSections.has('countries')}
              onToggle={() => handleSectionToggle('countries')}
              expandedCountries={expandedCountries}
              onToggleCountry={handleCountryToggle}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />

            {/* Tournaments Section */}
            <TournamentsSection
              tournaments={tournaments}
              isCollapsed={collapsedSections.has('tournaments')}
              onToggle={() => handleSectionToggle('tournaments')}
              expandedCountries={expandedCountries}
              onToggleCountry={handleCountryToggle}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        </div>
      </div>
    </SidebarTheme>
  );
}
