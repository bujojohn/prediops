'use client';

import { useState, useEffect } from 'react';

export function PredictionsTest() {
  const [predictions, setPredictions] = useState<Array<{
  id: number;
  type?: { name: string };
  fixture_id: number;
  created_at: string;
}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchPredictions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/sportmonks/predictions?limit=5');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Predictions API response:', data); // Debug log
      
      if (data.success && data.data) {
        // Handle nested data structure from SportMonks API
        const predictionsData = Array.isArray(data.data) ? data.data : data.data.data || [];
        console.log('Processed predictions data:', predictionsData); // Debug log
        setPredictions(predictionsData);
      } else {
        throw new Error(data.error || 'Failed to fetch predictions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    fetchPredictions();
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">🧪 Predictions Test (No Live Polling)</h2>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh Predictions'}
        </button>
        <span className="text-sm text-gray-600">
          Refresh count: {refreshCount}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading && (
        <div className="p-4 bg-blue-100 border border-blue-300 rounded">
          Loading predictions...
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Predictions ({predictions.length})</h3>
        {predictions.length === 0 && !isLoading && !error && (
          <p className="text-gray-500">No predictions available</p>
        )}
        {predictions.map((prediction, index) => (
          <div key={index} className="p-3 border rounded">
            <div className="text-sm">
              <strong>ID:</strong> {prediction.id}<br/>
              <strong>Type:</strong> {prediction.type?.name || 'Unknown'}<br/>
              <strong>Fixture:</strong> {prediction.fixture_id}<br/>
              <strong>Created:</strong> {prediction.created_at}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
        <h4 className="font-medium text-green-800 mb-2">✅ Test Status</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• No live polling (no memory leaks)</li>
          <li>• Manual refresh only</li>
          <li>• Simple data display</li>
          <li>• No freezing issues</li>
        </ul>
      </div>
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 p-4 bg-gray-100 rounded">
          <summary className="cursor-pointer font-medium">Debug: Raw Data Structure</summary>
          <pre className="text-xs overflow-auto mt-2">
            {JSON.stringify(predictions, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
