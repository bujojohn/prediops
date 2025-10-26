'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search, RotateCcw, HelpCircle, Star, Clock, Calendar, ArrowUpDown } from 'lucide-react';

// Import existing components and hooks
import { TopLeaguesSection } from './sidebar/TopLeaguesSection';
import { CountriesSection } from './sidebar/CountriesSection';
import { TournamentsSection } from './sidebar/TournamentsSection';
import { useFavorites } from './sidebar/hooks/useFavorites';
import { useRecentSearches } from './sidebar/hooks/useRecentSearches';
import { useKeyboardShortcuts } from './sidebar/hooks/useKeyboardShortcuts';
import { useSorting } from './sidebar/hooks/useSorting';
// Removed fixture count import as per requirements

// Import TanStack Query hooks
import { 
  useCountriesQuery, 
  sidebarQueryKeys 
} from '@/app/hooks/useSidebarQueries';

// Removed League import as it's no longer used

interface SidebarWithTanStackQueryProps {
  showLogo?: boolean;
  onRefreshStateChange?: (isRefreshing: boolean) => void;
}

export function SidebarWithTanStackQuery({ 
  showLogo = false, 
  onRefreshStateChange 
}: SidebarWithTanStackQueryProps) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['top-leagues', 'tournaments'])); // Start with countries open, others collapsed
  // Removed counting-related state as per requirements
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // TanStack Query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Custom hooks
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentSearches, addToRecentSearches, clearRecentSearches } = useRecentSearches();
  const { sortBy, setSortBy, sortCountries } = useSorting();
  
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

    // Apply active filter (countries with leagues) - simplified without fixture counting
    if (showActiveOnly) {
      filtered = filtered.filter(country => 
        country.leagues && country.leagues.length > 0
      );
    }

    // Apply today filter (countries with leagues) - simplified without fixture counting
    if (showTodayOnly) {
      filtered = filtered.filter(country => 
        country.leagues && country.leagues.length > 0
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
    showActiveOnly, 
    showTodayOnly, 
    isFavorite,
    favorites,
    sortCountries
  ]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.trim().length >= 2) {
      addToRecentSearches(term);
    }
    setShowRecentSearches(false);
  }, [addToRecentSearches]);

  // Handle refresh - simplified without counting features
  const handleRefresh = useCallback(async () => {
    onRefreshStateChange?.(true);
    try {
      // Clear local state
      setExpandedCountries(new Set());
      
      // Invalidate all sidebar queries to force refresh
      await queryClient.invalidateQueries({ 
        queryKey: sidebarQueryKeys.all 
      });
      
      // Refetch countries data
      await refetchCountries();
    } catch (error) {
      console.error('Error refreshing sidebar data:', error);
    } finally {
      onRefreshStateChange?.(false);
    }
  }, [queryClient, refetchCountries, onRefreshStateChange]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    searchInputRef,
    onToggleFavorites: () => setShowFavoritesOnly(!showFavoritesOnly),
    onToggleActive: () => setShowActiveOnly(!showActiveOnly),
    onToggleToday: () => setShowTodayOnly(!showTodayOnly),
    onRefresh: handleRefresh,
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

  // Removed old country toggle function - replaced with simplified version above

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
            onClick={handleRefresh}
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
            onFocus={() => setShowRecentSearches(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Recent Searches Dropdown */}
          {showRecentSearches && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  {search}
                </button>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={clearRecentSearches}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Clear History
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Sorting */}
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'fixtures' | 'favorites')}
            className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="fixtures">Fixtures</option>
            <option value="favorites">Favorites</option>
          </select>
        </div>

        {/* Tools Grid - 3 columns, 1 row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Column 1: Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Refresh data"
          >
            <RotateCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {/* Column 2: Favorites Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-lg border transition-colors duration-200 ${
              showFavoritesOnly
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="Toggle favorites filter"
          >
            <Star className="w-3 h-3" />
            <span className="hidden sm:inline">Fav</span>
          </button>
          
          {/* Column 3: More Tools Popover */}
          <div className="relative group">
            <button
              className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title="More tools"
            >
              <span className="text-xs">⋯</span>
              <span className="hidden sm:inline">More</span>
            </button>
            
            {/* Popover Content */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Tools & Filters</h3>
                
                {/* Active Filter */}
                <button
                  onClick={() => setShowActiveOnly(!showActiveOnly)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    showActiveOnly
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Active Only
                </button>
                
                {/* Today Filter */}
                <button
                  onClick={() => setShowTodayOnly(!showTodayOnly)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    showTodayOnly
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Today Only
                </button>
                
                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                
                {/* Help */}
                <button
                  onClick={() => {
                    alert(`Sidebar Help:

🔍 Search: Type to filter countries and leagues
⭐ Favorites: Toggle to show only favorited items  
🕒 Active: Show only countries with upcoming fixtures
📅 Today: Show only countries with fixtures today
🔄 Refresh: Reload all data from server
⌨️ Keyboard Shortcuts:
  - Ctrl/Cmd + K: Focus search
  - Ctrl/Cmd + F: Toggle favorites
  - Ctrl/Cmd + A: Toggle active filter
  - Ctrl/Cmd + T: Toggle today filter
  - Ctrl/Cmd + R: Refresh data
  - Esc: Clear search and unfocus`);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help & Shortcuts
                </button>
              </div>
            </div>
          </div>
        </div>
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
            {/* Top Leagues - simplified without counting */}
            <TopLeaguesSection 
              isCollapsed={collapsedSections.has('top-leagues')}
              onToggle={() => handleSectionToggle('top-leagues')}
            />

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
    </div>
  );
}
