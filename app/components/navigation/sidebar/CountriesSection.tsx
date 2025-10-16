'use client';

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, ChevronRight, Globe, Star, StarOff, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePathname } from 'next/navigation';
import { getCountryPredictionsUrl, generateLeagueSlug } from '@/lib/utils/country-utils';
import type { CountryWithLeagues, League } from './types';

interface CountriesSectionProps {
  countries: CountryWithLeagues[];
  isCollapsed: boolean;
  onToggle: () => void;
  expandedCountries: Set<number>;
  onToggleCountry: (countryId: number) => void;
  countryLeagues: Map<number, League[]>;
  loadingStates: Map<number, boolean>;
  countryTodayCounts: Map<number, number>;
  loadingCounts: Set<number>;
  leagueFixtureCounts: Map<number, number>;
  loadingLeagueCounts: Set<number>;
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
}

export function CountriesSection({
  countries,
  isCollapsed,
  onToggle,
  expandedCountries,
  onToggleCountry,
  countryLeagues,
  loadingStates,
  countryTodayCounts,
  loadingCounts,
  leagueFixtureCounts,
  loadingLeagueCounts,
  favorites,
  onToggleFavorite,
}: CountriesSectionProps) {
  const pathname = usePathname();
  const countriesContainerRef = useRef<HTMLDivElement>(null);

  // Setup virtual scrolling for countries list
  const countriesVirtualizer = useVirtualizer({
    count: countries.length,
    getScrollElement: () => countriesContainerRef.current,
    estimateSize: () => 45, // Estimated height of each country item
    overscan: 5, // Render 5 extra items above and below visible area
    measureElement: (element) => {
      // Add null check to prevent parentNode errors
      if (!element || !element.parentNode) {
        return 45; // Return estimated size if element is not properly attached
      }
      return element.getBoundingClientRect().height;
    },
  });

  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 mb-2 rounded-lg bg-gradient-to-r from-blue-50/90 to-blue-100/90 dark:from-blue-900/40 dark:to-blue-800/40 hover:from-blue-100/90 hover:to-blue-200/90 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50 transition-all duration-200 group border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Countries</span>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0.5 bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
          >
            {countries.length}
          </Badge>
        </div>
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
        ) : (
          <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
        )}
      </button>

      {!isCollapsed && (
        <div
          ref={countriesContainerRef}
          className="max-h-[calc(100vh/3)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
          style={{ position: 'relative' }}
        >
          <div
            style={{
              height: `${countriesVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {countries.length > 0 && countriesVirtualizer.getVirtualItems().map((virtualItem) => {
              const country = countries[virtualItem.index];
              
              // Safety check to prevent errors if country is undefined
              if (!country) {
                return null;
              }
              
              const isExpanded = expandedCountries.has(country.id);
              const leagues = countryLeagues.get(country.id) || [];
              const isLoadingLeagues = loadingStates.get(country.id) || false;
              const countryName = country.name || country.fifa_name || country.official_name || '';

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={(el) => {
                    if (el && countriesVirtualizer.measureElement) {
                      countriesVirtualizer.measureElement(el);
                    }
                  }}
                  className="space-y-0.5"
                  id={`country-${country.id}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {/* Country Header */}
                  <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-accent/80 hover:text-accent-foreground transition-all duration-150 hover:scale-[1.01] hover:shadow-sm">
                    <button
                      onClick={() => onToggleCountry(country.id)}
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
                      {loadingCounts.has(country.id) ? (
                        <div className="ml-1 h-4 w-6 bg-muted animate-pulse rounded flex-shrink-0" />
                      ) : (
                        <Badge
                          variant="outline"
                          className={`text-[10px] ml-1 flex-shrink-0 ${
                            (countryTodayCounts.get(country.id) ?? 0) > 0
                              ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                              : 'bg-muted text-muted-foreground'
                          }`}
                          title={
                            (countryTodayCounts.get(country.id) ?? 0) > 0
                              ? `${countryTodayCounts.get(country.id)} fixtures today`
                              : 'No fixtures today'
                          }
                        >
                          {countryTodayCounts.get(country.id) ?? 0}
                        </Badge>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Favorite Star */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(country.id);
                        }}
                        className={`p-1.5 rounded-md transition-all duration-150 hover:scale-110 active:scale-95 ${
                          favorites.has(country.id) 
                            ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/20 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/30' 
                            : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20'
                        }`}
                        title={favorites.has(country.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.has(country.id) ? <Star className="h-3 w-3 fill-current" /> : <StarOff className="h-3 w-3" />}
                      </button>
                      <a
                        href={getCountryPredictionsUrl(country)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-all duration-150 hover:scale-110 active:scale-95 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
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
                        <div className="p-1.5 text-xs text-muted-foreground">Loading leagues...</div>
                      ) : leagues.length > 0 ? (
                        leagues.map((league) => {
                          const active = pathname?.includes(`/predictions/league/${league.id}/`);
                          const fixtureCount = leagueFixtureCounts.get(league.id) ?? 0;
                          const isLoadingCount = loadingLeagueCounts.has(league.id);

                          return (
                            <div
                              key={league.id}
                              className={`flex items-center justify-between p-1.5 rounded-md hover:bg-accent/80 hover:text-accent-foreground transition-all duration-150 hover:scale-[1.01] hover:shadow-sm ${
                                active ? 'bg-accent/60' : ''
                              }`}
                            >
                              <a
                                href={`/predictions/league/${league.id}/${generateLeagueSlug({ name: league.name, id: league.id })}`}
                                className={`flex items-center gap-1.5 flex-1 text-xs min-w-0 ${active ? 'text-primary font-medium' : ''}`}
                                title={`League ID: ${league.id}`}
                              >
                                <span className="truncate max-w-[100px]" title={league.name}>
                                  {league.name}
                                </span>
                                {league.short_code && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-1 py-0.5 flex-shrink-0 ${active ? 'border-primary text-primary' : ''}`}
                                  >
                                    {league.short_code}
                                  </Badge>
                                )}
                                {isLoadingCount ? (
                                  <div className="h-4 w-6 bg-muted animate-pulse rounded flex-shrink-0" />
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] flex-shrink-0 ${
                                      fixtureCount > 0
                                        ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                    title={fixtureCount > 0 ? `${fixtureCount} fixtures in next 7 days` : 'No fixtures in next 7 days'}
                                  >
                                    {fixtureCount}
                                  </Badge>
                                )}
                              </a>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-1.5 text-xs text-muted-foreground">No active leagues found</div>
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

