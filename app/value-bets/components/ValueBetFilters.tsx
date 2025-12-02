'use client';

import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ValueBetFilters, ValueBetStats } from '@/lib/utils/value-bet-utils';

interface ValueBetFiltersProps {
  filters: ValueBetFilters;
  onFilterChange: (key: keyof ValueBetFilters, value: unknown) => void;
  stats: ValueBetStats;
}

export function ValueBetFilters({ filters, onFilterChange, stats }: ValueBetFiltersProps) {
  const toggleSortOrder = () => {
    onFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Search
        </CardTitle>
        <CardDescription>
          Find the best value betting opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by bet type or bookmaker..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Value Filter */}
          <div className="flex gap-2">
            <Button
              variant={filters.filterValue === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('filterValue', 'all')}
            >
              All ({stats.totalBets})
            </Button>
            <Button
              variant={filters.filterValue === 'value' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('filterValue', 'value')}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              Value ({stats.valueBetsCount})
            </Button>
            <Button
              variant={filters.filterValue === 'high-value' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('filterValue', 'high-value')}
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
            >
              High Value ({stats.highValueBets})
            </Button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="value">Value</option>
              <option value="odds">Odds</option>
              <option value="stake">Stake</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="px-2"
            >
              {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

