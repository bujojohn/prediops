'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedDateFilterRow } from '@/app/components/fixtures/UnifiedDateFilterRow';
import { FixtureFilters, DEFAULT_FILTERS } from '@/app/components/fixtures/fixture-search-utils';
import { Calendar, Filter, ChevronLeft } from 'lucide-react';
import type { Fixture } from '@/schemas/fixture.schema';

// Mock fixture data for demonstration
const mockFixtures: Fixture[] = [
  {
    id: 1,
    starting_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    participants: [
      { id: 1, name: 'Manchester United', meta: { location: 'home' } },
      { id: 2, name: 'Liverpool FC', meta: { location: 'away' } }
    ],
    league: { id: 1, name: 'Premier League', country: { id: 1, name: 'England' } },
    venue: { id: 1, name: 'Old Trafford', city: { id: 1, name: 'Manchester' } },
    predictions: [],
    scores: []
  },
  {
    id: 2,
    starting_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    participants: [
      { id: 3, name: 'Arsenal FC', meta: { location: 'home' } },
      { id: 4, name: 'Chelsea FC', meta: { location: 'away' } }
    ],
    league: { id: 2, name: 'La Liga', country: { id: 2, name: 'Spain' } },
    venue: { id: 2, name: 'Emirates Stadium', city: { id: 2, name: 'London' } },
    predictions: [],
    scores: []
  }
];

/**
 * Example component demonstrating the UnifiedDateFilterRow
 * Shows the new horizontal layout with three columns
 */
export function UnifiedDateFilterRowExample() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState<FixtureFilters>(DEFAULT_FILTERS);
  const [selectionHistory, setSelectionHistory] = useState<Array<{
    type: 'date' | 'filter';
    value: string | FixtureFilters;
    timestamp: string;
  }>>([]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectionHistory(prev => [
      { type: 'date', value: date, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9) // Keep last 10 entries
    ]);
  };

  const handleFiltersChange = (newFilters: FixtureFilters) => {
    setFilters(newFilters);
    setSelectionHistory(prev => [
      { type: 'filter', value: newFilters, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9) // Keep last 10 entries
    ]);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, value) => {
      if (Array.isArray(value)) {
        return count + (value.length > 0 ? 1 : 0);
      }
      if (typeof value === 'string') {
        return count + (value.length > 0 ? 1 : 0);
      }
      if (typeof value === 'object' && value !== null) {
        return count + (Object.values(value).some(v => v) ? 1 : 0);
      }
      return count + (value !== null ? 1 : 0);
    }, 0);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Unified Date Filter Row Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Horizontal layout with three columns: Date Picker | Date Range | Filters
        </p>
      </div>

      {/* Main Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Three-Column Layout Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Selection Display */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Selected Date:</span>
                <Badge variant="outline" className="ml-2">
                  {selectedDate}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Active Filters:</span>
                <Badge variant={getActiveFiltersCount() > 0 ? "default" : "secondary"} className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              </div>
            </div>
            {filters.dateRange.from && filters.dateRange.to && (
              <div className="mt-2">
                <span className="font-medium">Date Range:</span>
                <Badge variant="outline" className="ml-2">
                  {filters.dateRange.from} - {filters.dateRange.to}
                </Badge>
              </div>
            )}
          </div>

          {/* Unified Date Filter Row */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-2">UnifiedDateFilterRow Component:</div>
            <UnifiedDateFilterRow
              fixtures={mockFixtures}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              maxPastDays={7}
              maxFutureDays={21}
              showSearch={true}
              showLeagueFilter={true}
              showTeamFilter={true}
              showStatusFilter={true}
              showDateFilter={true}
              showPredictionsFilter={true}
              showValueBetsFilter={true}
            />
          </div>

          {/* Column Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Column 1: Date Picker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Horizontal scrollable dates</li>
                  <li>• Format: &quot;12 Sep&quot;, &quot;1 Jan&quot;</li>
                  <li>• Today highlighted by default</li>
                  <li>• Chevron navigation</li>
                  <li>• Click to select date</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Column 2: Date Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Range selector icon</li>
                  <li>• Popover/lightbox interface</li>
                  <li>• Single date or range mode</li>
                  <li>• Visual range display</li>
                  <li>• 21-day future limit</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Column 3: Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Filter icon with badge</li>
                  <li>• Popover with all filters</li>
                  <li>• Collapsible sections</li>
                  <li>• Active filter count</li>
                  <li>• Clear all option</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Key Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Implemented</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Horizontal date picker with chevron navigation</li>
                <li>• Date format: &quot;12 Sep&quot;, &quot;1 Jan&quot; style</li>
                <li>• Today as default selection</li>
                <li>• Scrollable date range</li>
                <li>• Date range selector with popover</li>
                <li>• Filter icon with popover</li>
                <li>• Three-column layout</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">🎨 Design Benefits</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Consistent with predictions page</li>
                <li>• Space-efficient horizontal layout</li>
                <li>• Clear visual separation</li>
                <li>• Intuitive icon-based interface</li>
                <li>• Touch-friendly for mobile</li>
                <li>• Unified experience across pages</li>
                <li>• Collapsible filter sections</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection History */}
      {selectionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Selection History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectionHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">{entry.type}</Badge>
                    <span className="text-sm">
                      {entry.type === 'date' ? entry.value as string : 
                       entry.type === 'filter' ? `${Object.keys(entry.value as FixtureFilters).length} filter properties` : 
                       'Unknown'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{entry.timestamp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Code Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`import { UnifiedDateFilterRow } from '@/app/components/fixtures/UnifiedDateFilterRow';

export function MyComponent({ fixtures }: { fixtures: Fixture[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  return (
    <UnifiedDateFilterRow
      fixtures={fixtures}
      filters={filters}
      onFiltersChange={setFilters}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      maxPastDays={7}
      maxFutureDays={21}
      showSearch={true}
      showLeagueFilter={true}
      showTeamFilter={true}
      showStatusFilter={true}
      showDateFilter={true}
      showPredictionsFilter={true}
      showValueBetsFilter={true}
    />
  );
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export default UnifiedDateFilterRowExample;
