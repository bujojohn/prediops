'use client';

import type { Fixture } from '@/schemas/fixture.schema';

interface FixtureStatisticsProps {
  statistics: unknown;
  fixture: Fixture;
  compact?: boolean;
}

export function FixtureStatistics({ statistics, fixture, compact = false }: FixtureStatisticsProps) {
  // Parse statistics data structure from SportMonks API
  // The structure is typically: { data: [{ participant_id, statistics: [{ type: { name, code }, value }] }] }
  const statsData = statistics as {
    data?: Array<{
      participant_id?: number;
      statistics?: Array<{
        type?: { name?: string; code?: string };
        value?: number | string;
      }>;
    }>;
  } | null;

  if (!statsData?.data || statsData.data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Statistics not available
      </div>
    );
  }

  const homeTeam = fixture.participants?.find(p => p.meta?.location === 'home');
  const awayTeam = fixture.participants?.find(p => p.meta?.location === 'away');

  const homeStats = statsData.data.find(s => s.participant_id === homeTeam?.id);
  const awayStats = statsData.data.find(s => s.participant_id === awayTeam?.id);

  // Common statistics to display
  const statKeys = [
    { code: 'possession', label: 'Possession' },
    { code: 'shots', label: 'Shots' },
    { code: 'shots_on_target', label: 'Shots on Target' },
    { code: 'corners', label: 'Corners' },
    { code: 'fouls', label: 'Fouls' },
    { code: 'yellow_cards', label: 'Yellow Cards' },
    { code: 'red_cards', label: 'Red Cards' },
    { code: 'offsides', label: 'Offsides' },
    { code: 'passes', label: 'Passes' },
    { code: 'pass_accuracy', label: 'Pass Accuracy' },
  ];

  const getStatValue = (stats: typeof homeStats, code: string): string | number | null => {
    if (!stats?.statistics) return null;
    const stat = stats.statistics.find(s => 
      s.type?.code?.toLowerCase() === code.toLowerCase() ||
      s.type?.name?.toLowerCase().replace(/\s+/g, '_') === code.toLowerCase()
    );
    return stat?.value ?? null;
  };

  if (compact) {
    // Show only key stats in a horizontal layout
    const keyStats = statKeys.slice(0, 6);
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {keyStats.map((statKey) => {
          const homeValue = getStatValue(homeStats, statKey.code);
          const awayValue = getStatValue(awayStats, statKey.code);
          
          if (homeValue === null && awayValue === null) return null;
          
          return (
            <div key={statKey.code} className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{statKey.label}</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{homeValue ?? '-'}</span>
                <span className="text-xs text-gray-400">vs</span>
                <span className="text-sm font-medium">{awayValue ?? '-'}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Full statistics view with comparison bars
  return (
    <div className="space-y-4">
      {statKeys.map((statKey) => {
        const homeValue = getStatValue(homeStats, statKey.code);
        const awayValue = getStatValue(awayStats, statKey.code);
        
        if (homeValue === null && awayValue === null) return null;
        
        const homeNum = typeof homeValue === 'number' ? homeValue : parseFloat(String(homeValue)) || 0;
        const awayNum = typeof awayValue === 'number' ? awayValue : parseFloat(String(awayValue)) || 0;
        const total = homeNum + awayNum;
        const homePercent = total > 0 ? (homeNum / total) * 100 : 50;
        const awayPercent = total > 0 ? (awayNum / total) * 100 : 50;
        
        // Special handling for percentage stats (like possession)
        const isPercentage = statKey.code === 'possession' || statKey.code === 'pass_accuracy';
        
        return (
          <div key={statKey.code} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium w-24 text-right">{homeValue ?? '-'}</span>
              <span className="text-gray-500 dark:text-gray-400 flex-1 text-center text-xs">
                {statKey.label}
              </span>
              <span className="font-medium w-24 text-left">{awayValue ?? '-'}</span>
            </div>
            {!isPercentage && total > 0 && (
              <div className="flex h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 transition-all"
                  style={{ width: `${homePercent}%` }}
                />
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${awayPercent}%` }}
                />
              </div>
            )}
            {isPercentage && (
              <div className="flex h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 transition-all"
                  style={{ width: `${homePercent}%` }}
                />
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${awayPercent}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


