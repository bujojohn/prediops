'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, Clock, Users, Trophy, Globe, Loader2, Play, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { generateLeagueSlug } from '@/lib/utils/country-utils';
import { generateCountryUrl } from '@/lib/utils/routing';
import { generateTeamSlug } from '@/lib/utils/team-utils';
import { generateFixtureSlug } from '@/lib/utils/slug-utils';
import { useSearch } from '@/app/hooks/useSearch';
import { SearchScope } from './SearchScopeDropdown';

interface ServerSideSearchResultsProps {
  searchTerm: string;
  searchScope: SearchScope;
}

export function ServerSideSearchResults({ searchTerm, searchScope }: ServerSideSearchResultsProps) {
  const { results, isLoading, error, hasResults } = useSearch(searchTerm, searchScope);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState<{
    fixtures: boolean;
    teams: boolean;
    leagues: boolean;
    countries: boolean;
  }>({
    fixtures: false,
    teams: false,
    leagues: false,
    countries: false,
  });

  // Toggle expandable section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        // Results will be hidden when searchTerm becomes empty
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show if no search term
  if (!searchTerm.trim()) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
        <div className="p-4 text-center">
          <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Searching for &ldquo;{searchTerm}&rdquo;...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
        <div className="p-4 text-center">
          <div className="text-sm text-red-500">
            Search failed. Please try again.
          </div>
        </div>
      </div>
    );
  }

  // Show "No results found" if searching but no results
  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
        <div className="p-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No results found for &ldquo;{searchTerm}&rdquo; in {searchScope === 'all' ? 'all categories' : searchScope}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={resultsRef} className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-3">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
          <Search className="h-3 w-3" />
          {results.totalResults} results for &ldquo;{searchTerm}&rdquo; in {searchScope === 'all' ? 'all categories' : searchScope}
        </div>

        <div className="space-y-3">
          {/* Fixtures Results - Show first as they're most relevant */}
          {results.fixtures.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Upcoming Matches ({results.fixtures.length})
              </div>
              <div className="space-y-1">
                {(expandedSections.fixtures ? results.fixtures : results.fixtures.slice(0, 3)).map((fixture, index: number) => {
                  // Format date and time
                  const formatDateTime = (dateString?: string) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    const now = new Date();
                    const isToday = date.toDateString() === now.toDateString();
                    const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
                    
                    const timeStr = date.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    });
                    
                    if (isToday) return `Today ${timeStr}`;
                    if (isTomorrow) return `Tomorrow ${timeStr}`;
                    
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });
                  };

                  // Get match status
                  const getMatchStatus = () => {
                    if (fixture.state?.name === 'Finished') return 'FT';
                    if (fixture.state?.name === 'In Play') return 'LIVE';
                    
                    // For now, let's avoid showing scores until we understand the structure better
                    // This prevents the [object Object] issue
                    return formatDateTime(fixture.starting_at || undefined);
                  };

                  // Get appropriate icon based on match state
                  const getMatchIcon = () => {
                    if (fixture.state?.name === 'In Play') {
                      return <Play className="h-4 w-4 text-red-500" />;
                    }
                    if (fixture.state?.name === 'Finished') {
                      return <CheckCircle className="h-4 w-4 text-green-500" />;
                    }
                    return <Clock className="h-4 w-4 text-orange-500" />;
                  };

                  return (
                    <a
                      key={`${fixture.id}-${index}`}
                      href={`/fixture/${fixture.id}/${generateFixtureSlug(fixture)}`}
                      className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {getMatchIcon()}
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-xs font-medium">
                          {fixture.participants?.[0]?.name || 'Team 1'} vs {fixture.participants?.[1]?.name || 'Team 2'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {fixture.league?.name || 'Unknown League'}
                          {fixture.league?.country?.name && ` (${fixture.league.country.name})`}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                          {getMatchStatus()}
                        </div>
                      </div>
                    </a>
                  );
                })}
                {results.fixtures.length > 3 && (
                  <button
                    onClick={() => toggleSection('fixtures')}
                    className="w-full text-xs text-gray-500 dark:text-gray-400 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center gap-1"
                  >
                    {expandedSections.fixtures ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        +{results.fixtures.length - 3} more matches
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Teams Results */}
          {results.teams.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Teams ({results.teams.length})
              </div>
              <div className="space-y-1">
                {(expandedSections.teams ? results.teams : results.teams.slice(0, 4)).map((team, index: number) => (
                  <a
                    key={`${team.id}-${index}`}
                    href={`/team/${team.id}/${generateTeamSlug({ id: team.id, name: team.name })}`}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="truncate flex-1">{team.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      ({team.country?.name || 'Unknown Country'})
                    </span>
                  </a>
                ))}
                {results.teams.length > 4 && (
                  <button
                    onClick={() => toggleSection('teams')}
                    className="w-full text-xs text-gray-500 dark:text-gray-400 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center gap-1"
                  >
                    {expandedSections.teams ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        +{results.teams.length - 4} more teams
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Leagues Results */}
          {results.leagues.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Leagues ({results.leagues.length})
              </div>
              <div className="space-y-1">
                {(expandedSections.leagues ? results.leagues : results.leagues.slice(0, 4)).map((league, index: number) => (
                  <a
                    key={`${league.id}-${index}`}
                    href={`/predictions/league/${league.id}/${generateLeagueSlug({ name: league.name || '', id: league.id })}`}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Trophy className="h-4 w-4 text-green-500" />
                    <span className="truncate flex-1">{league.name || 'Unknown League'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      ({league.country?.name || 'Unknown Country'})
                    </span>
                  </a>
                ))}
                {results.leagues.length > 4 && (
                  <button
                    onClick={() => toggleSection('leagues')}
                    className="w-full text-xs text-gray-500 dark:text-gray-400 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center gap-1"
                  >
                    {expandedSections.leagues ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        +{results.leagues.length - 4} more leagues
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Countries Results */}
          {results.countries.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Countries ({results.countries.length})
              </div>
              <div className="space-y-1">
                {(expandedSections.countries ? results.countries : results.countries.slice(0, 3)).map((country) => (
                  <a
                    key={country.id}
                    href={generateCountryUrl(country)}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="truncate flex-1">{country.name || 'Unknown Country'}</span>
                    <Badge variant="outline" className="text-xs">
                      {country.leagues?.length || 0}
                    </Badge>
                  </a>
                ))}
                {results.countries.length > 3 && (
                  <button
                    onClick={() => toggleSection('countries')}
                    className="w-full text-xs text-gray-500 dark:text-gray-400 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center gap-1"
                  >
                    {expandedSections.countries ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        +{results.countries.length - 3} more countries
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
