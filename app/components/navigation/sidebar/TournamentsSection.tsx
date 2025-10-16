'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Star, StarOff, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePathname } from 'next/navigation';
import { getCountryPredictionsUrl, generateLeagueSlug } from '@/lib/utils/country-utils';
import type { CountryWithLeagues, League } from './types';

interface TournamentsSectionProps {
  tournaments: CountryWithLeagues[];
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

export function TournamentsSection({
  tournaments,
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
}: TournamentsSectionProps) {
  const pathname = usePathname();

  if (tournaments.length === 0) return null;

  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 mb-2 rounded-lg bg-gradient-to-r from-purple-50/90 to-purple-100/90 dark:from-purple-900/40 dark:to-purple-800/40 hover:from-purple-100/90 hover:to-purple-200/90 dark:hover:from-purple-900/50 dark:hover:to-purple-800/50 transition-all duration-200 group border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Tournaments</span>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0.5 bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
          >
            {tournaments.length}
          </Badge>
        </div>
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
        ) : (
          <ChevronDown className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
        )}
      </button>

      {!isCollapsed && (
        <div className="space-y-0.5">
          {tournaments.map((tournament) => {
            const isExpanded = expandedCountries.has(tournament.id);
            const leagues = countryLeagues.get(tournament.id) || [];
            const isLoadingLeagues = loadingStates.get(tournament.id) || false;
            const tournamentName = tournament.name || tournament.fifa_name || tournament.official_name || '';

            return (
              <div key={tournament.id} className="space-y-0.5" id={`country-${tournament.id}`}>
                {/* Tournament Header */}
                <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-accent/80 hover:text-accent-foreground transition-all duration-150 hover:scale-[1.01] hover:shadow-sm">
                  <button
                    onClick={() => onToggleCountry(tournament.id)}
                    className="flex items-center gap-1.5 flex-1 text-left min-w-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    <span
                      className={`font-medium truncate text-sm max-w-[100px] ${
                        (tournament.leaguesCount || 0) === 0 ? 'text-muted-foreground italic' : ''
                      }`}
                      title={tournamentName}
                    >
                      {tournamentName}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] ml-1 flex-shrink-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    >
                      Tournament
                    </Badge>
                    {loadingCounts.has(tournament.id) ? (
                      <div className="ml-1 h-4 w-6 bg-muted animate-pulse rounded flex-shrink-0" />
                    ) : (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ml-1 flex-shrink-0 ${
                          (countryTodayCounts.get(tournament.id) ?? 0) > 0
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-muted text-muted-foreground'
                        }`}
                        title={
                          (countryTodayCounts.get(tournament.id) ?? 0) > 0
                            ? `${countryTodayCounts.get(tournament.id)} fixtures today`
                            : 'No fixtures today'
                        }
                      >
                        {countryTodayCounts.get(tournament.id) ?? 0}
                      </Badge>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Favorite Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(tournament.id);
                      }}
                      className={`p-1.5 rounded-md transition-all duration-150 hover:scale-110 active:scale-95 ${
                        favorites.has(tournament.id) 
                          ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/20 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/30' 
                          : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20'
                      }`}
                      title={favorites.has(tournament.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.has(tournament.id) ? <Star className="h-3 w-3 fill-current" /> : <StarOff className="h-3 w-3" />}
                    </button>
                    <a
                      href={getCountryPredictionsUrl(tournament)}
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
      )}
    </div>
  );
}

