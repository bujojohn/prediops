'use client';
import { useEffect, useState } from 'react';
import { MobileResponsiveTest } from './mobile-responsive-test';

interface APIResponse {
  success: boolean;
  data?: {
    predictions?: unknown[];
    valueBets?: unknown[];
    liveFixtures?: unknown[];
    note?: string;
  };
  error?: string;
  timestamp?: string;
}

export default function TestPage() {
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'api' | 'mobile'>('api');

  useEffect(() => {
    // Test multiple endpoints with your active plan
    Promise.all([
      fetch('/api/sportmonks/predictions').then(res => res.json()),
      fetch('/api/sportmonks/value-bets').then(res => res.json()),
      fetch('/api/sportmonks/fixtures/live').then(res => res.json()),
    ])
      .then(([predictions, valueBets, liveFixtures]) => {
        setResponse({
          success: true,
          data: {
            predictions: predictions.data?.slice(0, 3), // Show first 3
            valueBets: valueBets.data?.slice(0, 3),
            liveFixtures: liveFixtures.data?.slice(0, 3),
          },
          timestamp: new Date().toISOString(),
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setResponse({
          success: false,
          error: err.message || 'Failed to connect to API',
        });
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Testing your active SportMonks plan...</p>
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
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'api'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🔌 API Test
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'mobile'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📱 Mobile Responsive Test
        </button>
      </div>

      {/* API Test Tab */}
      {activeTab === 'api' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">🎉 Active Plan Test - SportMonks API</h2>
          
          {response?.success ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-semibold flex items-center">
                  ✅ SUCCESS! Your SportMonks API is working!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Active Plan: Custom Worldwide + Predictions
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
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-green-600 mb-2">💰 Value Bets</h3>
                  <p className="text-sm text-gray-600">
                    {response.data?.valueBets?.length || 0} value bets loaded
                  </p>
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-red-600 mb-2">⚽ Live Matches</h3>
                  <p className="text-sm text-gray-600">
                    {response.data?.liveFixtures?.length || 0} live matches
                  </p>
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
                    <strong>Note:</strong> The application is currently using mock data for demonstration. 
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
    </div>
  );
} 