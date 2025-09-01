'use client';

import { useState } from 'react';
import { sportmonks } from '@/lib/sportmonks';

export default function TestApiEndpoint() {
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Testing getLeaguesByFixtureDate with date: ${testDate}`);
               console.log('Include parameter: country (valid include)');
      
             const response = await sportmonks.getLeaguesByFixtureDate(testDate, {
         include: 'country',
         per_page: 50,
         page: 1,
       });

      console.log('API Response:', response);
      setResult(response);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testAlternativeInclude = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Testing getLeaguesByFixtureDate with alternative include: country`);
      console.log('Date:', testDate);
      
      const response = await sportmonks.getLeaguesByFixtureDate(testDate, {
        include: 'country',
        per_page: 50,
        page: 1,
      });

      console.log('API Response (alternative):', response);
      setResult(response);
    } catch (err: any) {
      console.error('API Error (alternative):', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testBasicCall = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Testing getLeaguesByFixtureDate with no parameters`);
      console.log('Date:', testDate);
      
      const response = await sportmonks.getLeaguesByFixtureDate(testDate);

      console.log('API Response (basic):', response);
      setResult(response);
    } catch (err: any) {
      console.error('API Error (basic):', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Test SportMonks API Endpoint</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Test getLeaguesByFixtureDate</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Test Date:</label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            className="border rounded px-3 py-2 mr-4"
          />
        </div>

        <div className="space-x-4">
          <button
            onClick={testEndpoint}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test with country (valid)
          </button>
          
          <button
            onClick={testAlternativeInclude}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test with country only
          </button>
          
          <button
            onClick={testBasicCall}
            disabled={isLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test with no parameters
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-4 p-4 bg-yellow-100 rounded-lg">
          <p className="text-yellow-800">Testing API endpoint...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error:</h3>
          <pre className="text-red-700 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-green-100 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Success!</h3>
          <div className="mb-2">
            <strong>Total Leagues:</strong> {result.data?.length || 0}
          </div>
          <div className="mb-2">
            <strong>Response Structure:</strong>
          </div>
          <pre className="text-green-700 text-sm overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">What This Tests:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Direct API call to <code>getLeaguesByFixtureDate</code></li>
          <li>Different include parameter combinations</li>
          <li>Error handling and response structure</li>
          <li>Console logging for debugging</li>
        </ul>
      </div>
    </div>
  );
}
