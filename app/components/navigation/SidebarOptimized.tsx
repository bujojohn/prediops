'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
// Icons moved into tools components
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
import { useKeyboardShortcuts } from './sidebar/hooks/useKeyboardShortcuts';
import { useSorting } from './sidebar/hooks/useSorting';
import { useCountriesQuery } from '@/app/hooks/useSidebarQueries';
import { useServerSideLeagues } from '@/app/hooks/useServerSideLeagues';
import { SearchScope } from './sidebar/SearchScopeDropdown';
import { SidebarToolsSection } from './sidebar/tools/SidebarToolsSection';
import { FilterTools } from './sidebar/tools/FilterTools';
import { SortControl } from './sidebar/tools/SortControl';
import { ActionButtons } from './sidebar/tools/ActionButtons';
import { HelpModal } from './sidebar/tools/HelpModal';
import { useFilterPreferences } from './sidebar/tools/hooks/useFilterPreferences';


interface SidebarOptimizedProps {
  showLogo?: boolean;
}

/**
 * Optimized sidebar component that uses local data directly
 * No API calls, instant loading, follows SportMonks best practices
 */
export function SidebarOptimized({ 
  showLogo = false,
}: SidebarOptimizedProps) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['tournaments']));
  const [helpOpen, setHelpOpen] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks
  const { favorites, toggleFavorite } = useFavorites();
  const { sortCountries, sortBy, setSortBy } = useSorting();
  const filterPrefs = useFilterPreferences(searchScope);

  React.useEffect(() => {
    setShowFavoritesOnly(filterPrefs.state.favorites);
  }, [filterPrefs.state]);

  // Load local countries data from the optimized API endpoint
  // This endpoint reads from data/countries.json with 30-day caching
  const { 
    data: allCountries = [],
    isLoading: isLoadingCountries,
    isError: isErrorCountries
  } = useCountriesQuery();

  // Load all leagues server-side with 24-hour caching
  const { 
    data: leaguesByCountry = {},
    isLoading: isLoadingLeagues,
    isError: isErrorLeagues
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
    // Only filter out countries without leagues if leagues have finished loading successfully
    // If leagues are still loading or failed, show all countries to avoid empty list
    const regularCountries = enhancedCountries.filter(country => 
      !KNOWN_TOURNAMENTS.has(country.id) && 
      (isLoadingLeagues || isErrorLeagues || country.leaguesCount > 0)
    );

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

    // Apply sorting - simplified without counting
    const sortedCountries = sortCountries(filteredCountries, new Map(), favorites);
    const sortedTournaments = sortCountries(filteredTournaments, new Map(), favorites);

    return {
      filteredAndSortedCountries: sortedCountries,
      tournaments: sortedTournaments
    };
  }, [searchTerm, allCountries, leaguesByCountry, KNOWN_TOURNAMENTS, showFavoritesOnly, favorites, sortCountries, isLoadingLeagues, isErrorLeagues]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    searchInputRef,
    onToggleFavorites: () => {
      const next = !showFavoritesOnly;
      setShowFavoritesOnly(next);
      filterPrefs.setFavorites(next);
    },
  });

  // Handle search
  const handleSearch = useCallback((term: string) => {
    console.log('SidebarOptimized: handleSearch called with:', term);
    setSearchTerm(term);
  }, []);

  // Handle search scope change
  const handleSearchScopeChange = useCallback((scope: SearchScope) => {
    setSearchScope(scope);
  }, []);


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
            />
            {/* Search Results positioned relative to input */}
            <ServerSideSearchResults searchTerm={searchTerm} searchScope={searchScope} />
          </div>

          <SidebarToolsSection>
            <FilterTools
              favoritesActive={showFavoritesOnly}
              onToggleFavorites={() => {
                const next = !showFavoritesOnly;
                setShowFavoritesOnly(next);
                filterPrefs.setFavorites(next);
              }}
            />

            <SortControl value={sortBy} onChange={setSortBy} />

            <ActionButtons onShowHelp={() => setHelpOpen(true)} />
          </SidebarToolsSection>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto scrollbar-thick">
          <div className="p-1">
            {/* Loading States */}
            {(isLoadingCountries || isLoadingLeagues) && (
              <div className="p-3 space-y-2" aria-hidden="true">
                <div className="h-6 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                <div className="h-6 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                <div className="h-6 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                <div className="h-6 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                <div className="h-6 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
              </div>
            )}
            
            {/* Error States */}
            {(isErrorCountries || isErrorLeagues) && (
              <div className="flex items-center justify-center p-4 text-sm text-red-500">
                Error loading countries data. Please refresh the page.
              </div>
            )}
            
            {/* Countries Section */}
            {!isLoadingCountries && !isLoadingLeagues && !isErrorCountries && !isErrorLeagues && (
              <CountriesSection
                countries={filteredAndSortedCountries}
                isCollapsed={collapsedSections.has('countries')}
                onToggle={() => handleSectionToggle('countries')}
                expandedCountries={expandedCountries}
                onToggleCountry={handleCountryToggle}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            )}

            {/* Top Leagues Section */}
            <TopLeaguesSection
              isCollapsed={collapsedSections.has('top-leagues')}
              onToggle={() => handleSectionToggle('top-leagues')}
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
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </SidebarTheme>
  );
}
