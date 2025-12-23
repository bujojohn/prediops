import type { ValueBetStats } from '@/lib/utils/value-bet-utils';

interface ValueBetStatsCardsProps {
  stats: ValueBetStats;
  variant?: 'hero' | 'summary';
}

export function ValueBetStatsCards({ stats, variant = 'hero' }: ValueBetStatsCardsProps) {
  if (variant === 'hero') {
    return null; // Hero variant is handled by ValueBetHero component
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{stats.totalBets}</div>
        <div className="text-sm text-blue-600">Filtered Bets</div>
      </div>
      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{stats.valueBetsCount}</div>
        <div className="text-sm text-green-600">Value Bets</div>
      </div>
      <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
        <div className="text-2xl font-bold text-emerald-600">{stats.highValueBets}</div>
        <div className="text-sm text-emerald-600">High Value</div>
      </div>
      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">{stats.averageValue.toFixed(2)}</div>
        <div className="text-sm text-purple-600">Avg Value</div>
      </div>
    </div>
  );
}

