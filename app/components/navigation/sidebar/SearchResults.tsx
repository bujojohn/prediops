'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Users, Trophy, Star, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCountryPredictionsUrl, generateLeagueSlug } from '@/lib/utils/country-utils';
import type { SearchResults as SearchResultsType, CountryWithLeagues, League, Team, Fixture, SearchDataCache } from './types';

// Global cache for search data with expiry
const searchDataCache: {
  countries: SearchDataCache<CountryWithLeagues>;
  leagues: SearchDataCache<League>;
  teams: SearchDataCache<Team>;
  fixtures: SearchDataCache<Fixture>;
} = {
  countries: { data: [], timestamp: 0, ttl: 5 * 60 * 1000 }, // 5 minutes
  leagues: { data: [], timestamp: 0, ttl: 5 * 60 * 1000 },
  teams: { data: [], timestamp: 0, ttl: 5 * 60 * 1000 },
  fixtures: { data: [], timestamp: 0, ttl: 2 * 60 * 1000 }, // 2 minutes for fixtures (more dynamic)
};

// Cache helper functions
const getCachedData = <T,>(cache: SearchDataCache<T>): T[] | null => {
  const now = Date.now();
  if (cache.timestamp && (now - cache.timestamp) < cache.ttl && cache.data.length > 0) {
    return cache.data;
  }
  return null;
};

const setCachedData = <T,>(cache: SearchDataCache<T>, data: T[]) => {
  cache.data = data;
  cache.timestamp = Date.now();
};

interface SearchResultsProps {
  searchTerm: string;
}

export function SearchResults({ searchTerm }: SearchResultsProps) {
  const [searchResults, setSearchResults] = useState<SearchResultsType>({
    countries: [],
    leagues: [],
    teams: [],
    tournaments: [],
    fixtures: [],
    hasResults: false,
  });

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  // Debounced search - increased to 400ms to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Optimized data loading with caching and lazy loading
  useEffect(() => {
    const loadSearchData = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setSearchResults({
          countries: [],
          leagues: [],
          teams: [],
          tournaments: [],
          fixtures: [],
          hasResults: false,
        });
        return;
      }

      // Prevent duplicate concurrent requests
      if (loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);

      try {
        const searchLower = debouncedSearchTerm.toLowerCase();

        // Phase 1: Load countries (always needed, usually cached)
        let countries: CountryWithLeagues[] = getCachedData(searchDataCache.countries) || [];
        if (countries.length === 0) {
          const countriesRes = await fetch('/api/sportmonks/countries/with-leagues');
          const countriesData = await countriesRes.json();
          if (countriesData.success) {
            countries = countriesData.data || [];
            setCachedData(searchDataCache.countries, countries);
          }
        }

        // Filter countries immediately
        const matchingCountries = countries.filter((country) => {
          const name = (country.name || country.fifa_name || country.official_name || '').toLowerCase();
          return name.includes(searchLower);
        });

        // Determine if we need leagues/teams/fixtures based on search term
        const needsLeagues = searchLower.length >= 3; // Only load if 3+ chars
        const needsTeams = searchLower.length >= 3;
        const needsFixtures = searchLower.length >= 4; // Only for longer searches

        // Phase 2: Load leagues if needed
        let leagues: League[] = [];
        if (needsLeagues) {
          leagues = getCachedData(searchDataCache.leagues) || [];
          if (leagues.length === 0) {
            const leaguesRes = await fetch('/api/sportmonks/leagues?per_page=100&page=1');
            const leaguesData = await leaguesRes.json();
            if (leaguesData.success) {
              leagues = leaguesData.data || [];
              setCachedData(searchDataCache.leagues, leagues);
            }
          }
        }

        // Phase 3: Load teams if needed
        let teams: Team[] = [];
        if (needsTeams) {
          teams = getCachedData(searchDataCache.teams) || [];
          if (teams.length === 0) {
            const teamsRes = await fetch('/api/sportmonks/teams?per_page=100&page=1');
            const teamsData = await teamsRes.json();
            if (teamsData.success) {
              teams = teamsData.data || [];
              setCachedData(searchDataCache.teams, teams);
            }
          }
        }

        // Phase 4: Load fixtures if needed
        let fixtures: Fixture[] = [];
        if (needsFixtures) {
          fixtures = getCachedData(searchDataCache.fixtures) || [];
          if (fixtures.length === 0) {
            const fixturesRes = await fetch(`/api/sportmonks/fixtures/upcoming?per_page=50&page=1`);
            const fixturesData = await fixturesRes.json();
            if (fixturesData.success) {
              fixtures = fixturesData.data || [];
              setCachedData(searchDataCache.fixtures, fixtures);
            }
          }
        }

        // Process search results
        const results: SearchResultsType = {
          countries: matchingCountries,
          leagues: [],
          teams: [],
          tournaments: [],
          fixtures: [],
          hasResults: false,
        };

        // Filter leagues
        if (needsLeagues) {
          const matchingLeagues = leagues.filter(
            (league) =>
              league.name.toLowerCase().includes(searchLower) ||
              (league.short_code && league.short_code.toLowerCase().includes(searchLower))
          );

          matchingLeagues.forEach((league) => {
            const country = countries.find((c) => c.id === league.country_id);
            if (country) {
              results.leagues.push({ country, league });
            }
          });
        }

        // Filter teams
        if (needsTeams) {
          const matchingTeams = teams.filter((team) => team.name.toLowerCase().includes(searchLower));

          matchingTeams.forEach((team) => {
            const country = countries.find((c) => c.id === team.country_id);
            if (country) {
              results.teams.push({ country, team });
            }
          });
        }

        // Filter fixtures
        if (needsFixtures) {
          const matchingFixtures = fixtures.filter((fixture) => {
            const homeTeam = fixture.participants[0]?.name?.toLowerCase() || '';
            const awayTeam = fixture.participants[1]?.name?.toLowerCase() || '';
            const leagueName = fixture.league?.name?.toLowerCase() || '';

            return homeTeam.includes(searchLower) || awayTeam.includes(searchLower) || leagueName.includes(searchLower);
          });

          matchingFixtures.forEach((fixture) => {
            const country = countries.find((c) => c.id === fixture.league.country_id);
            if (country) {
              results.fixtures.push({ fixture, country });
            }
          });
        }

        // Filter tournaments
        const matchingTournaments = matchingCountries.filter((country) => {
          const name = (country.name || country.fifa_name || country.official_name || '').toLowerCase();

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
            'uefa',
            'caf',
            'afc',
          ];

          return (
            tournamentKeywords.some((keyword) => name.includes(keyword)) ||
            name.includes('continental') ||
            name.includes('regional') ||
            name.includes('intercontinental')
          );
        });

        results.tournaments = matchingTournaments;
        results.hasResults =
          results.countries.length > 0 ||
          results.leagues.length > 0 ||
          results.teams.length > 0 ||
          results.tournaments.length > 0 ||
          results.fixtures.length > 0;

        setSearchResults(results);
      } catch (error) {
        console.error('Error loading search data:', error);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    loadSearchData();
  }, [debouncedSearchTerm]);

  // Don't show if no search term or no results
  if (!debouncedSearchTerm.trim() || !searchResults.hasResults) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-3">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
          <Search className="h-3 w-3" />
          Results for &ldquo;{debouncedSearchTerm}&rdquo;
          {isLoading && (
            <div className="ml-2 h-3 w-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="space-y-3">
          {/* Fixtures Results - Show first as they're most relevant */}
          {searchResults.fixtures.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Upcoming Matches ({searchResults.fixtures.length})
              </div>
              <div className="space-y-1">
                {searchResults.fixtures.slice(0, 3).map((item, index) => (
                  <a
                    key={`${item.fixture.id}-${index}`}
                    href={`/predictions/league/${item.fixture.league.id}/${generateLeagueSlug({ name: item.fixture.league.name, id: item.fixture.league.id })}`}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs">
                        {item.fixture.participants[0]?.name} vs {item.fixture.participants[1]?.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.fixture.league.name}</div>
                    </div>
                  </a>
                ))}
                {searchResults.fixtures.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    +{searchResults.fixtures.length - 3} more matches
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Teams Results */}
          {searchResults.teams.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Teams ({searchResults.teams.length})</div>
              <div className="space-y-1">
                {searchResults.teams.slice(0, 4).map((item, index) => (
                  <a
                    key={`${item.country.id}-${item.team.id}-${index}`}
                    href={`/team/${item.team.id}/${item.team.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="truncate flex-1">{item.team.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">({item.country.name})</span>
                  </a>
                ))}
                {searchResults.teams.length > 4 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    +{searchResults.teams.length - 4} more teams
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leagues Results */}
          {searchResults.leagues.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Leagues ({searchResults.leagues.length})</div>
              <div className="space-y-1">
                {searchResults.leagues.slice(0, 4).map((item, index) => (
                  <a
                    key={`${item.country.id}-${item.league.id}-${index}`}
                    href={`/predictions/league/${item.league.id}/${generateLeagueSlug({ name: item.league.name, id: item.league.id })}`}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Trophy className="h-4 w-4 text-green-500" />
                    <span className="truncate flex-1">{item.league.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">({item.country.name})</span>
                  </a>
                ))}
                {searchResults.leagues.length > 4 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    +{searchResults.leagues.length - 4} more leagues
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tournaments Results */}
          {searchResults.tournaments.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Tournaments ({searchResults.tournaments.length})
              </div>
              <div className="space-y-1">
                {searchResults.tournaments.slice(0, 3).map((tournament) => (
                  <a
                    key={tournament.id}
                    href={getCountryPredictionsUrl(tournament)}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="truncate flex-1">{tournament.name || tournament.fifa_name}</span>
                    <Badge
                      variant="outline"
                      className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                    >
                      Tournament
                    </Badge>
                  </a>
                ))}
                {searchResults.tournaments.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    +{searchResults.tournaments.length - 3} more tournaments
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Countries Results */}
          {searchResults.countries.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Countries ({searchResults.countries.length})</div>
              <div className="space-y-1">
                {searchResults.countries.slice(0, 3).map((country) => (
                  <a
                    key={country.id}
                    href={getCountryPredictionsUrl(country)}
                    className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="truncate flex-1">{country.name || country.fifa_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {country.leaguesCount || 0}
                    </Badge>
                  </a>
                ))}
                {searchResults.countries.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                    +{searchResults.countries.length - 3} more countries
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

