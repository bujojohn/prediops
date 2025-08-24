'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { RefreshCw, Calendar, Clock, Trophy } from 'lucide-react';
import { 
  DatePickerProvider, 
  HorizontalDatePicker, 
  useDatePickerWithFixtures 
} from '../components/date-picker';

function DatePickerDemo() {
  const {
    selectedDate,
    selectDate,
    fixtures,
    isLoading,
    error,
    isDateCached,
    isDatePreloaded,
    refreshFixtures,
  } = useDatePickerWithFixtures();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Picker Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle>Date Selection</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <HorizontalDatePicker
            onDateSelect={selectDate}
            className="mb-4"
          />
          
          <div className="text-sm text-gray-600">
            <p><strong>Selected Date:</strong> {formatDate(selectedDate)}</p>
            <p><strong>Status:</strong> 
              {isDateCached(selectedDate) ? (
                <Badge className="ml-2 bg-green-100 text-green-800">Cached</Badge>
              ) : isDatePreloaded(selectedDate) ? (
                <Badge className="ml-2 bg-blue-100 text-blue-800">Preloaded</Badge>
              ) : (
                <Badge className="ml-2 bg-gray-100 text-gray-800">Not Loaded</Badge>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fixtures Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <CardTitle>Fixtures for {formatDate(selectedDate)}</CardTitle>
            </div>
            <Button
              onClick={refreshFixtures}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading fixtures...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600"><strong>Error:</strong> {error}</p>
            </div>
          )}

          {!isLoading && !error && fixtures.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No fixtures found for this date</p>
            </div>
          )}

          {!isLoading && !error && fixtures.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-3">
                Found {fixtures.length} fixture{fixtures.length !== 1 ? 's' : ''}
              </div>
              
              {fixtures.slice(0, 5).map((fixture) => (
                <div key={fixture.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Fixture #{fixture.id}</span>
                      <div className="text-sm text-gray-600">
                        {new Date(fixture.starting_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge variant="outline">View Details</Badge>
                  </div>
                </div>
              ))}
              
              {fixtures.length > 5 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    +{fixtures.length - 5} more fixtures
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cache Status Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Cached Dates</h4>
              <div className="space-y-1">
                {Array.from({ length: 5 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i - 2);
                  const dateStr = date.toISOString().split('T')[0];
                  return (
                    <div key={dateStr} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isDateCached(dateStr) ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className={isDateCached(dateStr) ? 'text-green-700' : 'text-gray-500'}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Preloaded Dates</h4>
              <div className="space-y-1">
                {Array.from({ length: 5 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i - 2);
                  const dateStr = date.toISOString().split('T')[0];
                  return (
                    <div key={dateStr} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isDatePreloaded(dateStr) ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <span className={isDatePreloaded(dateStr) ? 'text-blue-700' : 'text-gray-500'}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DatePickerTest() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📅 Horizontal Date Picker Test
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Test the new horizontal date picker component with smart caching, preloading, 
          and immediate fixture loading for selected dates.
        </p>
      </div>

      <DatePickerProvider>
        <DatePickerDemo />
      </DatePickerProvider>

      {/* Features Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🚀 Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Smart Caching:</strong> Previously loaded dates are cached</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Preloading:</strong> Adjacent dates are preloaded for smooth navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span><strong>Immediate Loading:</strong> Fixtures load instantly when date is selected</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span><strong>Horizontal Scroll:</strong> Compact date buttons with navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span><strong>Date Format:</strong> Yesterday, Today, Tomorrow, Fri 12 Aug</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span><strong>Responsive:</strong> Works on all screen sizes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
