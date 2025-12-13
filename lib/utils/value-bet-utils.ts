import type { ValueBet } from '@/schemas/valuebet.schema';

export interface ValueBetStats {
  totalBets: number;
  valueBetsCount: number;
  highValueBets: number;
  averageValue: number;
}

export type ValueBetFilter = 'all' | 'value' | 'high-value';
export type ValueBetSortBy = 'value' | 'odds' | 'stake';
export type SortOrder = 'asc' | 'desc';

export interface ValueBetFilters {
  searchQuery: string;
  filterValue: ValueBetFilter;
  sortBy: ValueBetSortBy;
  sortOrder: SortOrder;
}

/**
 * Calculate statistics from value bets array
 */
export function calculateValueBetStats(valueBets: ValueBet[]): ValueBetStats {
  const totalBets = valueBets.length;
  const valueBetsCount = valueBets.filter(bet => bet.predictions.is_value).length;
  const highValueBets = valueBets.filter(bet => bet.predictions.stake > 0.1).length;
  const averageValue = totalBets > 0 
    ? valueBets.reduce((sum, bet) => sum + bet.predictions.stake, 0) / totalBets 
    : 0;

  return { totalBets, valueBetsCount, highValueBets, averageValue };
}

/**
 * Filter and sort value bets based on filters
 */
export function filterValueBets(
  valueBets: ValueBet[],
  filters: ValueBetFilters
): ValueBet[] {
  let filtered = [...valueBets];

  // Apply search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(bet => 
      bet.predictions.bet.toLowerCase().includes(query) ||
      bet.predictions.bookmaker.toLowerCase().includes(query)
    );
  }

  // Apply value filter
  if (filters.filterValue === 'value') {
    filtered = filtered.filter(bet => bet.predictions.is_value);
  } else if (filters.filterValue === 'high-value') {
    filtered = filtered.filter(bet => bet.predictions.stake > 0.1);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (filters.sortBy) {
      case 'value':
        aValue = a.predictions.stake;
        bValue = b.predictions.stake;
        break;
      case 'odds':
        aValue = a.predictions.odd;
        bValue = b.predictions.odd;
        break;
      case 'stake':
        aValue = a.predictions.stake;
        bValue = b.predictions.stake;
        break;
      default:
        aValue = a.predictions.stake;
        bValue = b.predictions.stake;
    }

    return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return filtered;
}

/**
 * Check if filters have active values (non-default)
 */
export function hasActiveFilters(filters: ValueBetFilters): boolean {
  return (
    filters.searchQuery !== '' ||
    filters.filterValue !== 'all' ||
    filters.sortBy !== 'value' ||
    filters.sortOrder !== 'desc'
  );
}

