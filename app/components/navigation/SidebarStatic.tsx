'use client';

import React, { useState, useEffect, memo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, ArrowUpDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SidebarTheme } from './SidebarTheme';
import { Logo } from '@/components/ui/Logo';

// Import modular components
import { SearchResults } from './sidebar/SearchResults';
import { CountriesSection } from './sidebar/CountriesSection';
import { TopLeaguesSection } from './sidebar/TopLeaguesSection';
import { TournamentsSection } from './sidebar/TournamentsSection';

// Import custom hooks
import { useFavorites } from './sidebar/hooks/useFavorites';
import { useSidebarData } from './sidebar/hooks/useSidebarData';
import { useKeyboardShortcuts } from './sidebar/hooks/useKeyboardShortcuts';
import { useSorting } from './sidebar/hooks/useSorting';
// Removed getFixtureCountDateRange import as counting features are removed
import { SidebarToolsSection } from './sidebar/tools/SidebarToolsSection';
import { FilterTools } from './sidebar/tools/FilterTools';
// import { SortControl } from './sidebar/tools/SortControl';
import { ActionButtons } from './sidebar/tools/ActionButtons';
import { HelpModal } from './sidebar/tools/HelpModal';
import { useFilterPreferences } from './sidebar/tools/hooks/useFilterPreferences';

// Import types
import type { CountryWithLeagues } from './sidebar/types';

interface SidebarStaticProps {
  showLogo?: boolean;
}

export const SidebarStatic = memo(function SidebarStatic({ showLogo = false }: SidebarStaticProps = {}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  
  // Filter states
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const filterPrefs = useFilterPreferences('all');
  const [toolCounts, setToolCounts] = useState<{ favorites: number }>({ favorites: 0 });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    searchInputRef,
    onToggleFavorites: () => {
      const next = !showFavoritesOnly;
      setShowFavoritesOnly(next);
      filterPrefs.setFavorites(next);
    },
  });
  
  if (isHomePage) {
    return null;
  }

  return (
    <SidebarTheme>
      <div className="flex flex-col h-full bg-gradient-to-b from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/90 backdrop-blur-sm">
        {/* Logo Header - Only show on mobile or when explicitly requested */}
        {showLogo && (
          <div className="p-3 border-b border-sidebar-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
            <Logo size="sm" showText={true} />
          </div>
        )}
        
        {/* Header with Search */}
        <div className="p-2 border-b bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search countries, leagues... (Ctrl+K)"
              className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:bg-white/90 dark:hover:bg-gray-800/90 shadow-sm hover:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Search Results Dropdown */}
            <SearchResults searchTerm={searchTerm} />
          </div>
          
        {/* Unified Tools Section */}
        <SidebarToolsSection>
          <FilterTools
            favoritesActive={showFavoritesOnly}
            count={toolCounts.favorites}
            onToggleFavorites={() => {
              const next = !showFavoritesOnly;
              setShowFavoritesOnly(next);
              filterPrefs.setFavorites(next);
            }}
          />

          {/* Sorting is handled within the content section */}

          <ActionButtons
            onShowHelp={() => setHelpOpen(true)}
          />
        </SidebarToolsSection>
        </div>

        {/* Dynamic Content Area - This will stream in */}
        <div className="flex-1 overflow-auto scrollbar-thick">
          <SidebarContent 
            searchTerm={searchTerm} 
            showFavoritesOnly={showFavoritesOnly}
            onCountsChange={setToolCounts}
          />
        </div>
        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </SidebarTheme>
  );
});

// Dynamic content that loads the actual sidebar data with full functionality
function SidebarContent({ 
  searchTerm, 
  showFavoritesOnly, 
  onCountsChange,
}: { 
  searchTerm: string;
  showFavoritesOnly: boolean;
  onCountsChange?: (counts: { favorites: number }) => void;
}) {
  // Use custom hooks
  const { favorites, toggleFavorite } = useFavorites();
  const { allCountries, loadCountriesWithLeagues, loadCountryLeagues } = useSidebarData();
  const { sortBy, setSortBy, sortCountries } = useSorting();

  // Local state
  const [filteredCountries, setFilteredCountries] = useState<CountryWithLeagues[]>([]);
  const [expandedCountries, setExpandedCountries] = useState<Set<number>>(new Set());
  // Removed counting-related state as counting features are removed
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isLoading] = useState(false);

  // Top leagues data - memoized to prevent dependency issues
  // Toggle section collapse
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Toggle country expansion
  const toggleCountry = useCallback(
    (countryId: number) => {
      setExpandedCountries((prev) => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(countryId)) {
          newExpanded.delete(countryId);
        } else {
          newExpanded.add(countryId);
          // Load leagues when expanding - simplified without counting
          loadCountryLeagues(countryId);
        }
        return newExpanded;
      });
    },
    [loadCountryLeagues]
  );

  // Removed loadTodayFixtureCounts function as counting features are removed

  // Tournament detection logic
  const KNOWN_TOURNAMENTS = React.useMemo(
    () =>
      new Set([
        41, // Europe
        147, // Africa
    11240938, // Asia (AFC)
      ]),
    []
  );

  const isTournament = useCallback(
    (country: CountryWithLeagues) => {
    if (KNOWN_TOURNAMENTS.has(country.id)) return true;
    
    const name = (country.name || country.fifa_name || country.official_name || '').trim().toLowerCase();
    if (!name) return false;
    
      const continents = new Set(['africa', 'europe', 'asia', 'north america', 'south america', 'oceania', 'antarctica', 'world', 'international']);
    if (continents.has(name)) return true;
    
    const orgs = ['uefa', 'caf', 'afc', 'conmebol', 'concacaf', 'ofc', 'fifa'];
    const code = (country.fifa_name || country.official_name || '').trim().toLowerCase();
      if (orgs.some((org) => name.includes(org) || code.includes(org))) return true;
    
    if (name.includes('continental') || name.includes('regional') || name.includes('intercontinental')) return true;
    
    const tournamentKeywords = [
        'champions league',
        'europa league',
        'europa conference league',
        'conference league',
        'african cup',
        'asian cup',
        'copa america',
        'gold cup',
        'oceanian cup',
        'nations league',
        'confederations cup',
        'club world cup',
        'super cup',
        'world cup',
        'euro',
        'copa libertadores',
        'copa sudamericana',
      ];

      if (tournamentKeywords.some((keyword) => name.includes(keyword))) return true;
    
    return false;
    },
    [KNOWN_TOURNAMENTS]
  );

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

  // Load countries on mount
  useEffect(() => {
    loadCountriesWithLeagues();
  }, [loadCountriesWithLeagues]);

  // Removed fixture counting useEffect for top leagues as counting features are removed
  // Removed refresh trigger useEffect - refresh functionality removed as it's not relevant for static navigation data

  // Removed fixture counting useEffect as counting features are removed

  // Filter and sort countries based on search term, filter options, and sort preference
  useEffect(() => {
    let filtered = allCountries;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((country) => {
        const name = (country.name || country.fifa_name || country.official_name || '').toLowerCase();
        return name.includes(searchLower);
      });
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter((country) => favorites.has(country.id));
    }
    
    // Apply sorting - simplified without counting
    const sorted = sortCountries(filtered, new Map(), favorites);

    setFilteredCountries(sorted);
    // Update header tool counts (favorites uses favorites Set)
    onCountsChange?.({
      favorites: favorites.size,
    });
  }, [searchTerm, allCountries, showFavoritesOnly, favorites, sortBy, sortCountries, onCountsChange]);

  // Show skeleton while data is loading
  if (isLoading || allCountries.length === 0) {
    return <SidebarContentSkeleton />;
  }

  return (
    <div className="p-1">
      {/* Sorting Controls */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200/50 dark:border-gray-700/50">
          <ArrowUpDown className="h-3 w-3 text-gray-600 dark:text-gray-400" />
          <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
          <div className="flex gap-1">
        <button
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                sortBy === 'name'
                  ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:shadow-sm'
              }`}
              title="Sort alphabetically by name"
            >
              Name
        </button>
                  <button
              onClick={() => setSortBy('fixtures')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                sortBy === 'fixtures'
                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-300 border border-green-200/50 dark:border-green-700/50 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:shadow-sm'
              }`}
              title="Sort by fixture count (most first)"
            >
              Fixtures
                  </button>
                    <button
              onClick={() => setSortBy('favorites')}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                sortBy === 'favorites'
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 dark:from-yellow-900/40 dark:to-yellow-800/40 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-700/50 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:shadow-sm'
              }`}
              title="Show favorites first"
            >
              Favorites
                    </button>
                  </div>
                </div>
      </div>
      
      {/* 1. Countries Section */}
      <CountriesSection
        countries={countryItems}
        isCollapsed={collapsedSections.has('countries')}
        onToggle={() => toggleSection('countries')}
        expandedCountries={expandedCountries}
        onToggleCountry={toggleCountry}
        // Removed counting-related props as counting features are removed
        // Removed league counting props as counting features are removed
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      {/* 2. Top Leagues Section */}
      <TopLeaguesSection
        isCollapsed={collapsedSections.has('top-leagues')}
        onToggle={() => toggleSection('top-leagues')}
        // Removed league counting props as counting features are removed
      />

      {/* 3. Tournaments Section */}
      <TournamentsSection
        tournaments={tournamentItems}
        isCollapsed={collapsedSections.has('tournaments')}
        onToggle={() => toggleSection('tournaments')}
        expandedCountries={expandedCountries}
        onToggleCountry={toggleCountry}
        // Removed counting-related props as counting features are removed
        // Removed league counting props as counting features are removed
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
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

