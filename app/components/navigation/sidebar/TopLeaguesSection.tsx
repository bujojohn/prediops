'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Trophy, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePathname } from 'next/navigation';
import { generateLeagueSlug } from '@/lib/utils/country-utils';
import type { TopLeague } from './types';

interface TopLeaguesSectionProps {
  isCollapsed: boolean;
  onToggle: () => void;
  leagueFixtureCounts: Map<number, number>;
  loadingLeagueCounts: Set<number>;
}

export function TopLeaguesSection({
  isCollapsed,
  onToggle,
  leagueFixtureCounts,
  loadingLeagueCounts,
}: TopLeaguesSectionProps) {
  const pathname = usePathname();

  const topLeagues: TopLeague[] = [
    { id: 8, name: 'Premier League', country: 'England', short_code: 'EPL', countryId: 462 },
    { id: 564, name: 'La Liga', country: 'Spain', short_code: 'LL', countryId: 32 },
    { id: 384, name: 'Serie A', country: 'Italy', short_code: 'SA', countryId: 251 },
    { id: 351, name: 'Bundesliga', country: 'Germany', short_code: 'BL', countryId: 11 },
    { id: 301, name: 'Ligue 1', country: 'France', short_code: 'L1', countryId: 17 },
    { id: 7, name: 'Championship', country: 'England', short_code: 'CH', countryId: 462 },
    { id: 72, name: 'Eredivisie', country: 'Netherlands', short_code: 'ED', countryId: 38 },
    { id: 238, name: 'Primeira Liga', country: 'Portugal', short_code: 'PL', countryId: 20 },
  ];

  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 mb-2 rounded-lg bg-gradient-to-r from-green-50/90 to-green-100/90 dark:from-green-900/40 dark:to-green-800/40 hover:from-green-100/90 hover:to-green-200/90 dark:hover:from-green-900/50 dark:hover:to-green-800/50 transition-all duration-200 group border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-900 dark:text-green-100">Top Leagues</span>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0.5 bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
          >
            {topLeagues.length}
          </Badge>
        </div>
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />
        ) : (
          <ChevronDown className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />
        )}
      </button>

      {!isCollapsed && (
        <div className="space-y-0.5">
          {topLeagues.map((league) => {
            const fixtureCount = leagueFixtureCounts.get(league.id) ?? 0;
            const isLoadingCount = loadingLeagueCounts.has(league.id);
            const active = pathname?.includes(`/predictions/league/${league.id}/`);

            return (
              <div
                key={league.id}
                className={`flex items-center justify-between p-1.5 rounded-md hover:bg-accent/80 hover:text-accent-foreground transition-all duration-150 hover:scale-[1.01] hover:shadow-sm ${
                  active ? 'bg-accent/60' : ''
                }`}
              >
                <a
                  href={`/predictions/league/${league.id}/${generateLeagueSlug({ name: league.name, id: league.id })}`}
                  className={`flex items-center gap-1.5 flex-1 text-left min-w-0 ${active ? 'text-primary font-medium' : ''}`}
                >
                  <span className="font-medium text-sm truncate max-w-[100px]" title={`${league.name} (${league.country})`}>
                    {league.name}
                  </span>
                  <Badge variant="outline" className={`text-[9px] px-1 flex-shrink-0 ${active ? 'border-primary text-primary' : ''}`}>
                    {league.short_code}
                  </Badge>
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
                <a
                  href={`/predictions/league/${league.id}/${generateLeagueSlug({ name: league.name, id: league.id })}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-all duration-150 hover:scale-110 active:scale-95 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 flex-shrink-0"
                  title="Open predictions page"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

