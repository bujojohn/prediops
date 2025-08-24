'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MobileResponsiveTest } from './mobile-responsive-test';
import { PredictionMarketsTest } from './prediction-markets-test';
import { LiveMatchesTest } from './live-matches-test';
import { LiveMatchesErrorBoundary } from './live-matches-error-boundary';
import { SimpleLiveTest } from './simple-live-test';
import { OptimizedLiveScoresTest } from './optimized-live-scores-test';
import { SimpleOptimizedTest } from './simple-optimized-test';
import { PredictionsTest } from './predictions-test';

interface APIResponse {
  success: boolean;
  data?: {
    predictions?: unknown[]; // Prediction[] from schema
    valueBets?: unknown[];   // ValueBet[] from schema 
    liveFixtures?: unknown[]; // Fixture[] from schema
    note?: string;
  };
  error?: string;
  timestamp?: string;
}

// React Query hooks for API routes
function usePredictions() {
  return useQuery({
    queryKey: ['sportmonks', 'predictions'],
    queryFn: async () => {
      const response = await fetch('/api/sportmonks/predictions?limit=10');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (increase cache time)
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: false, // Disable automatic fetching
  });
}

function useValueBets() {
  return useQuery({
    queryKey: ['sportmonks', 'value-bets'],
    queryFn: async () => {
      const response = await fetch('/api/sportmonks/value-bets?limit=5');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: false, // Disable automatic fetching
  });
}

function useLiveFixtures() {
  return useQuery({
    queryKey: ['sportmonks', 'live-fixtures'],
    queryFn: async () => {
      const response = await fetch('/api/sportmonks/fixtures/live?limit=5');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute (reduce frequency)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every 1 minute (reduce frequency)
    enabled: false, // Disable automatic fetching
  });
}

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<'api' | 'mobile' | 'predictions' | 'live' | 'simple' | 'optimized' | 'simple-optimized' | 'predictions-test'>('api');
  const [pageError, setPageError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Use React Query hooks for data fetching
  const predictionsQuery = usePredictions();
  const valueBetsQuery = useValueBets();
  const liveFixturesQuery = useLiveFixtures();

  // Manual data loading for performance
  useEffect(() => {
    if (activeTab === 'api' && !dataLoaded) {
      console.log('TestPage: Loading API data...');
      predictionsQuery.refetch();
      valueBetsQuery.refetch();
      liveFixturesQuery.refetch();
      setDataLoaded(true);
    }
  }, [activeTab, dataLoaded, predictionsQuery, valueBetsQuery, liveFixturesQuery]);

  // Handle tab changes with error catching
  const handleTabChange = (tab: 'api' | 'mobile' | 'predictions' | 'live' | 'simple' | 'optimized' | 'simple-optimized' | 'predictions-test') => {
    try {
      console.log('TestPage: Changing tab to:', tab);
      setActiveTab(tab);
    } catch (err) {
      console.error('TestPage: Tab change error:', err);
      setPageError(`Tab change error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  // Show page error if something went wrong
  if (pageError) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Test Page Error</h3>
          <p className="text-red-700 mb-4">{pageError}</p>
          <button 
            onClick={() => setPageError(null)} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if any queries are still loading
  const isLoading = (activeTab === 'api' && !dataLoaded) || 
                   predictionsQuery.isLoading || 
                   valueBetsQuery.isLoading || 
                   liveFixturesQuery.isLoading;
  
  // Check if any queries have errors
  const hasErrors = predictionsQuery.error || valueBetsQuery.error || liveFixturesQuery.error;
  
  // Prepare response data based on actual SportMonks ApiListResponse<T> structure
  // SportMonks API returns: { data: T[], pagination?: {...}, subscription?: {...}, rate_limit?: {...} }
  const response: APIResponse = {
    success: !hasErrors,
    data: {
      predictions: Array.isArray(predictionsQuery.data?.data) ? predictionsQuery.data.data.slice(0, 3) : [],
      valueBets: Array.isArray(valueBetsQuery.data?.data) ? valueBetsQuery.data.data.slice(0, 3) : [],
      liveFixtures: Array.isArray(liveFixturesQuery.data?.data) ? liveFixturesQuery.data.data.slice(0, 3) : [],
      note: predictionsQuery.data?.note || valueBetsQuery.data?.note || liveFixturesQuery.data?.note,
    },
    error: hasErrors ? 'One or more API calls failed' : undefined,
    timestamp: new Date().toISOString(),
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Testing your active SportMonks plan...</p>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {predictionsQuery.isLoading && <p>Loading predictions...</p>}
          {valueBetsQuery.isLoading && <p>Loading value bets...</p>}
          {liveFixturesQuery.isLoading && <p>Loading live fixtures...</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        🧪 Comprehensive Test Suite - Prediops
      </h1>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => handleTabChange('api')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'api'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🔌 API Test
        </button>
        <button
          onClick={() => handleTabChange('mobile')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'mobile'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📱 Mobile Responsive Test
        </button>
        <button
          onClick={() => handleTabChange('predictions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'predictions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎯 Prediction Markets Test
        </button>
        <button
          onClick={() => handleTabChange('live')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'live'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚽ Live Matches Test
        </button>
        <button
          onClick={() => handleTabChange('simple')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'simple'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🧪 Simple Live Test
        </button>
        <button
          onClick={() => handleTabChange('optimized')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'optimized'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🚀 Optimized Live Scores
        </button>
        <button
          onClick={() => handleTabChange('simple-optimized')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'simple-optimized'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🧪 Simple Optimized
        </button>
        <button
          onClick={() => handleTabChange('predictions-test')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'predictions-test'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🧪 Predictions Test
        </button>
      </div>

      {/* API Test Tab */}
      {activeTab === 'api' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🎉 Active Plan Test - SportMonks API</h2>
            <button
              onClick={() => {
                setDataLoaded(false);
                predictionsQuery.refetch();
                valueBetsQuery.refetch();
                liveFixturesQuery.refetch();
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Loading...' : '🔄 Refresh Data'}
            </button>
          </div>
          
          {response?.success ? (
            <div className="space-y-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 font-semibold flex items-center">
              ✅ SUCCESS! Your SportMonks API is working!
            </p>
            <p className="text-green-600 text-sm mt-1">
              Active Plan: Custom Worldwide + Predictions
            </p>
            <p className="text-blue-600 text-sm mt-2">
              ⚡ Performance Optimized: Limited data loading, manual refresh, reduced update frequency
            </p>
            {response.data?.note && (
              <p className="text-yellow-600 text-sm mt-2">
              ⚠️ {response.data.note}
              </p>
            )}
          </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-blue-600 mb-2">🎯 Predictions</h3>
                  <p className="text-sm text-gray-600">
                    {response.data?.predictions?.length || 0} predictions loaded
                  </p>
                  {predictionsQuery.isError && (
                    <p className="text-red-500 text-xs mt-1">Error loading predictions</p>
                  )}
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-green-600 mb-2">💰 Value Bets</h3>
                  <p className="text-sm text-gray-600">
                    {response.data?.valueBets?.length || 0} value bets loaded
                  </p>
                  {valueBetsQuery.isError && (
                    <p className="text-red-500 text-xs mt-1">Error loading value bets</p>
                  )}
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-red-600 mb-2">⚽ Live Matches</h3>
                  <p className="text-sm text-gray-600">
                    {response.data?.liveFixtures?.length || 0} live matches
                  </p>
                  {liveFixturesQuery.isError && (
                    <p className="text-red-500 text-xs mt-1">Error loading live fixtures</p>
                  )}
                </div>
              </div>

              <details className="bg-gray-50 border rounded-lg p-4">
                <summary className="cursor-pointer font-medium">
                  📊 View Raw API Response
                </summary>
                <pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto text-xs">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </details>

              {/* Query Status Debug Info */}
              <details className="bg-gray-50 border rounded-lg p-4">
                <summary className="cursor-pointer font-medium">
                  🔍 Query Status Debug Info
                </summary>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium">Predictions Query:</h4>
                      <p>Status: {predictionsQuery.status}</p>
                      <p>Error: {predictionsQuery.error ? 'Yes' : 'No'}</p>
                      <p>Data: {predictionsQuery.data ? 'Loaded' : 'Not loaded'}</p>
                      {predictionsQuery.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs">View Data Structure</summary>
                          <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                            {JSON.stringify(predictionsQuery.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Value Bets Query:</h4>
                      <p>Status: {valueBetsQuery.status}</p>
                      <p>Error: {valueBetsQuery.error ? 'Yes' : 'No'}</p>
                      <p>Data: {valueBetsQuery.data ? 'Loaded' : 'Not loaded'}</p>
                      {valueBetsQuery.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs">View Data Structure</summary>
                          <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                            {JSON.stringify(valueBetsQuery.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">Live Fixtures Query:</h4>
                      <p>Status: {liveFixturesQuery.status}</p>
                      <p>Error: {liveFixturesQuery.error ? 'Yes' : 'No'}</p>
                      <p>Data: {liveFixturesQuery.data ? 'Loaded' : 'Not loaded'}</p>
                      {liveFixturesQuery.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs">View Data Structure</summary>
                          <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                            {JSON.stringify(liveFixturesQuery.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </details>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-semibold">❌ Error connecting to API</p>
              <p className="text-red-600 text-sm mt-1">
                {response?.error || 'Unknown error occurred'}
              </p>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-yellow-800 mb-2">Setup Instructions:</h4>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. Create a <code>.env.local</code> file in your project root</li>
                  <li>2. Add your SportMonks API token: <code>SPORTMONKS_API_TOKEN=your_token_here</code></li>
                  <li>3. Add the base URL: <code>SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3/football</code></li>
                  <li>4. Restart your development server</li>
                </ol>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-700 text-sm">
                    <strong>Note:</strong> The application now uses proper error handling instead of mock data. 
                    Add your API token to see real data from SportMonks.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Responsive Test Tab */}
      {activeTab === 'mobile' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">📱 Mobile Responsive Test</h2>
          <MobileResponsiveTest />
        </div>
      )}

      {/* Prediction Markets Test Tab */}
      {activeTab === 'predictions' && (
        <div>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              ⚡ <strong>Performance Note:</strong> Prediction markets test uses cached data and optimized rendering to prevent resource issues.
            </p>
          </div>
          <h2 className="text-2xl font-bold mb-4">🎯 Prediction Markets Test</h2>
          <PredictionMarketsTest />
        </div>
      )}

      {/* Live Matches Test Tab */}
      {activeTab === 'live' && (
        <div>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚡ <strong>Performance Note:</strong> Live matches test uses optimized timers (2-minute intervals) and limited mock data to prevent resource issues.
            </p>
          </div>
          <h2 className="text-2xl font-bold mb-4">⚽ Live Matches Test</h2>
          <LiveMatchesErrorBoundary>
            <LiveMatchesTest />
          </LiveMatchesErrorBoundary>
        </div>
      )}

      {/* Simple Live Test Tab */}
      {activeTab === 'simple' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">🧪 Simple Live Test</h2>
          <SimpleLiveTest />
        </div>
      )}

      {/* Optimized Live Scores Tab */}
      {activeTab === 'optimized' && (
        <div>
          <OptimizedLiveScoresTest />
        </div>
      )}

      {/* Simple Optimized Tab */}
      {activeTab === 'simple-optimized' && (
        <div>
          <SimpleOptimizedTest />
        </div>
      )}

      {/* Predictions Test Tab */}
      {activeTab === 'predictions-test' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">🧪 Predictions Test (No Live Polling)</h2>
          <PredictionsTest />
        </div>
      )}
    </div>
  );
} 