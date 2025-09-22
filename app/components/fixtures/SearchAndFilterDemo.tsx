'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FixtureSearchAndFilter } from './FixtureSearchAndFilter';
import { useFixtureSearchAndFilter } from '@/app/hooks/useFixtureSearchAndFilter';
import type { Fixture } from '@/schemas/fixture.schema';

interface SearchAndFilterDemoProps {
  fixtures: Fixture[];
  title?: string;
  description?: string;
}

/**
 * Demo component showcasing the search and filter functionality
 * Useful for testing and demonstrating the system
 */
export function SearchAndFilterDemo({
  fixtures,
  title = 'Search & Filter Demo',
  description = 'Try the search and filter functionality below:',
}: SearchAndFilterDemoProps) {
  const [variant, setVariant] = useState<'compact' | 'full'>('compact');
  
  const {
    filters,
    filteredFixtures,
    hasActiveFilters,
    updateFilters,
    clearFilters,
    filterStats,
  } = useFixtureSearchAndFilter(fixtures);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Variant Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Display Mode:</span>
            <Button
              variant={variant === 'compact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVariant('compact')}
            >
              Compact
            </Button>
            <Button
              variant={variant === 'full' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVariant('full')}
            >
              Full
            </Button>
          </div>

          {/* Search and Filter Component */}
          <FixtureSearchAndFilter
            fixtures={fixtures}
            filters={filters}
            onFiltersChange={updateFilters}
            variant={variant}
            showSearch={true}
            showLeagueFilter={true}
            showTeamFilter={true}
            showStatusFilter={true}
            showDateFilter={true}
            showPredictionsFilter={true}
            showValueBetsFilter={true}
          />

          {/* Filter Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filterStats.total}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total Fixtures
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {filterStats.filtered}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Filtered Results
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {filterStats.leagues}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Unique Leagues
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {filterStats.teams}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Unique Teams
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Active Filters
                </h4>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(filters, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">Results Summary</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hasActiveFilters ? (
                <>
                  Showing {filterStats.filtered} of {filterStats.total} fixtures
                  {filterStats.filtered !== filterStats.total && (
                    <span className="text-green-600 dark:text-green-400">
                      {' '}({Math.round((filterStats.filtered / filterStats.total) * 100)}% of total)
                    </span>
                  )}
                </>
              ) : (
                <>Showing all {filterStats.total} fixtures</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sample Results */}
      {filteredFixtures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Results ({filteredFixtures.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFixtures.slice(0, 10).map((fixture) => (
                <div
                  key={fixture.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {fixture.participants
                          ?.map(p => p.name)
                          .join(' vs ') || 'Unknown Teams'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {fixture.league?.name} • {fixture.starting_at}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {fixture.predictions?.length || 0} predictions
                    </div>
                  </div>
                </div>
              ))}
              {filteredFixtures.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  ... and {filteredFixtures.length - 10} more fixtures
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
