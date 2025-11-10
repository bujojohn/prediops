'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';

// Import existing components and hooks
import { TopLeaguesSection } from './sidebar/TopLeaguesSection';
import { CountriesSection } from './sidebar/CountriesSection';
import { TournamentsSection } from './sidebar/TournamentsSection';
import { useFavorites } from './sidebar/hooks/useFavorites';
import { useKeyboardShortcuts } from './sidebar/hooks/useKeyboardShortcuts';
import { useSorting } from './sidebar/hooks/useSorting';
// Removed fixture count import as per requirements

// Import TanStack Query hooks
import { 
  useCountriesQuery
} from '@/app/hooks/useSidebarQueries';

// Add unified tools imports
import { SidebarToolsSection } from './sidebar/tools/SidebarToolsSection';
import { FilterTools } from './sidebar/tools/FilterTools';
import { SortControl } from './sidebar/tools/SortControl';
import { ActionButtons } from './sidebar/tools/ActionButtons';
import { HelpModal } from './sidebar/tools/HelpModal';
import { useFilterPreferences } from './sidebar/tools/hooks/useFilterPreferences';

// Removed League import as it's no longer used

interface SidebarWithTanStackQueryProps {
  showLogo?: boolean;
}

export function SidebarWithTanStackQuery({ 
  showLogo = false,
}: SidebarWithTanStackQueryProps) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['top-leagues', 'tournaments'])); // Start with countries open, others collapsed
  const [helpOpen, setHelpOpen] = useState(false);
  // Removed counting-related state as per requirements
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Custom hooks
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { sortBy, setSortBy, sortCountries } = useSorting();
  const filterPrefs = useFilterPreferences('all');

  // TanStack Query hooks - optimized for SportMonks best practices
  const { 
    data: allCountries = [], 
    isLoading: isLoadingCountries, 
    error: countriesError,
    refetch: refetchCountries 
  } = useCountriesQuery();

  // Removed topLeagues logic as TopLeaguesSection has its own hardcoded data

  // Filter and sort countries - simplified without counting features
  const filteredAndSortedCountries = useMemo(() => {
    let filtered = allCountries;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(country => 
        country.name.toLowerCase().includes(term) ||
        (country.leagues && country.leagues.some(league => league.name.toLowerCase().includes(term)))
      );
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(country => 
        isFavorite(country.id) || (country.leagues && country.leagues.some(league => isFavorite(league.id)))
      );
    }

    // Sort countries - simplified without counting
    const countriesWithLeagues = filtered.map(country => ({
      ...country,
      fixtureCount: 0, // Set to 0 as counting is removed
      leaguesCount: country.leagues?.length || 0
    }));
    return sortCountries(countriesWithLeagues, new Map(), favorites);
  }, [
    allCountries, 
    searchTerm, 
    showFavoritesOnly, 
    isFavorite,
    favorites,
    sortCountries
  ]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);


  // Keyboard shortcuts
  useKeyboardShortcuts({
    searchInputRef,
    onToggleFavorites: () => {
      const next = !showFavoritesOnly;
      setShowFavoritesOnly(next);
      filterPrefs.setFavorites(next);
    },
  });

  // Simplified country toggle - leagues are now loaded via TanStack Query with 24-hour caching
  const handleCountryToggle = useCallback((countryId: number) => {
    setExpandedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(countryId)) {
        newSet.delete(countryId);
      } else {
        newSet.add(countryId);
        // Leagues will be automatically loaded via useCountryLeaguesQuery with 24-hour caching
      }
      return newSet;
    });
  }, []);

  // Handle section collapse/expand
  const handleSectionToggle = useCallback((sectionName: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  }, []);

  // Loading state - simplified without counting features
  const isLoading = isLoadingCountries;

  // Error state
  const hasError = countriesError;

  if (hasError) {
    return (
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-600 dark:text-red-400 mb-2">Failed to load sidebar data</p>
          <button 
            onClick={() => {
              void refetchCountries();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {showLogo && (
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Prediops</h1>
          </div>
        )}
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search countries, leagues..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Unified Tools */}
        <SidebarToolsSection>
          <FilterTools
            favoritesActive={showFavoritesOnly}
            count={favorites.size}
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
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Countries - simplified without counting */}
            <CountriesSection
              countries={filteredAndSortedCountries}
              isCollapsed={collapsedSections.has('countries')}
              onToggle={() => handleSectionToggle('countries')}
              expandedCountries={expandedCountries}
              onToggleCountry={handleCountryToggle}
              // Removed counting-related props as per requirements
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />

            {/* Top Leagues - simplified without counting */}
            <TopLeaguesSection 
              isCollapsed={collapsedSections.has('top-leagues')}
              onToggle={() => handleSectionToggle('top-leagues')}
            />

            {/* Tournaments - simplified without counting */}
            <TournamentsSection
              tournaments={filteredAndSortedCountries}
              isCollapsed={collapsedSections.has('tournaments')}
              onToggle={() => handleSectionToggle('tournaments')}
              expandedCountries={expandedCountries}
              onToggleCountry={handleCountryToggle}
              // Removed counting-related props as per requirements
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        )}
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
