'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UnifiedDateSelector } from '@/app/components/date-picker/UnifiedDateSelector';
import { useUnifiedDateSelector } from '@/app/components/date-picker/useUnifiedDateSelector';
import { Calendar, Clock, Target, RotateCcw } from 'lucide-react';

/**
 * Example component demonstrating the UnifiedDateSelector
 * Shows both single date and date range selection modes
 */
export function UnifiedDateSelectorExample() {
  const [selectionHistory, setSelectionHistory] = useState<Array<{
    mode: string;
    date?: string;
    range?: { from: string | null; to: string | null };
    timestamp: string;
  }>>([]);

  const dateSelector = useUnifiedDateSelector({
    initialMode: 'single',
    maxFutureDays: 21,
    onSelectionChange: ({ mode, date, range }) => {
      // Add to history for demonstration
      setSelectionHistory(prev => [
        {
          mode,
          date,
          range,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4), // Keep only last 5 entries
      ]);
    },
  });

  const handleReset = () => {
    dateSelector.reset();
    setSelectionHistory([]);
  };

  const getSelectionSummary = () => {
    if (dateSelector.mode === 'single' && dateSelector.selectedDate) {
      return `Single date: ${dateSelector.getDisplayText()}`;
    } else if (dateSelector.mode === 'range' && dateSelector.selectedRange.from && dateSelector.selectedRange.to) {
      return `Date range: ${dateSelector.getDisplayText()}`;
    }
    return 'No selection';
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Unified Date Selector Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Single date selection (like predictions page) + Date range selection (like league predictions)
        </p>
      </div>

      {/* Main Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Date Selection Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Selection Display */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Current Selection:</span>
              <Badge variant={dateSelector.hasValidSelection() ? "default" : "secondary"}>
                {dateSelector.mode}
              </Badge>
            </div>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {getSelectionSummary()}
            </p>
            {dateSelector.hasValidSelection() && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <p>Query params: {JSON.stringify(dateSelector.getQueryParams())}</p>
              </div>
            )}
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-4">
            <span className="font-medium min-w-[100px]">Select Date:</span>
            <UnifiedDateSelector
              mode={dateSelector.mode}
              selectedDate={dateSelector.selectedDate}
              selectedRange={dateSelector.selectedRange}
              onDateChange={dateSelector.setSelectedDate}
              onRangeChange={dateSelector.setSelectedRange}
              onModeChange={dateSelector.setMode}
              maxFutureDays={21}
              showModeSwitcher={true}
              placeholder="Choose date or range"
              className="flex-1"
            />
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-4">
            <span className="font-medium min-w-[100px]">Mode:</span>
            <div className="flex gap-2">
              <Button
                variant={dateSelector.mode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => dateSelector.setMode('single')}
              >
                Single Date
              </Button>
              <Button
                variant={dateSelector.mode === 'range' ? 'default' : 'outline'}
                size="sm"
                onClick={() => dateSelector.setMode('range')}
              >
                Date Range
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Selection
            </Button>
            <Button 
              onClick={() => {
                const params = dateSelector.getQueryParams();
                console.log('Query parameters for URL:', params);
                alert(`Query parameters: ${JSON.stringify(params)}`);
              }}
            >
              Get Query Params
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Implemented</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Single date selection (predictions page style)</li>
                <li>• Date range selection (league predictions style)</li>
                <li>• Lightbox/modal interface</li>
                <li>• Future dates limited to 21 days</li>
                <li>• Past dates unlimited (configurable)</li>
                <li>• Mode switching between single/range</li>
                <li>• Mobile-friendly design</li>
                <li>• Query parameter generation</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">🎯 Key Benefits</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Unified interface for all date selection needs</li>
                <li>• Consistent UX across predictions and leagues</li>
                <li>• Flexible date constraints</li>
                <li>• Easy integration with existing filters</li>
                <li>• URL-friendly query parameters</li>
                <li>• Touch-optimized for mobile</li>
                <li>• Collapsible sections by default</li>
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
              <Clock className="h-5 w-5 text-purple-500" />
              Selection History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectionHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <Badge variant="outline" className="mr-2">{entry.mode}</Badge>
                    <span className="text-sm">
                      {entry.mode === 'single' ? entry.date : 
                       entry.range?.from && entry.range?.to ? 
                       `${entry.range.from} - ${entry.range.to}` : 
                       'Incomplete range'}
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
            <code>{`import { UnifiedDateSelector } from '@/app/components/date-picker/UnifiedDateSelector';
import { useUnifiedDateSelector } from '@/app/components/date-picker/useUnifiedDateSelector';

export function MyComponent() {
  const dateSelector = useUnifiedDateSelector({
    initialMode: 'single',
    maxFutureDays: 21,
    onSelectionChange: ({ mode, date, range }) => {
      // Handle selection changes
      console.log('Mode:', mode);
      console.log('Date:', date);
      console.log('Range:', range);
    },
  });

  return (
    <UnifiedDateSelector
      mode={dateSelector.mode}
      selectedDate={dateSelector.selectedDate}
      selectedRange={dateSelector.selectedRange}
      onDateChange={dateSelector.setSelectedDate}
      onRangeChange={dateSelector.setSelectedRange}
      onModeChange={dateSelector.setMode}
      maxFutureDays={21}
      showModeSwitcher={true}
    />
  );
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export default UnifiedDateSelectorExample;
