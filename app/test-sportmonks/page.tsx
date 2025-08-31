import { sportmonks } from '@/lib/sportmonks';

export default async function TestSportMonksPage() {
  let testResults = {
    leagues: null as any,
    countries: null as any,
    fixtures: null as any,
    errors: [] as string[]
  };

  try {
    // Test leagues API
    try {
      const leaguesResponse = await sportmonks.getLeagues({
        per_page: 10,
        page: 1
      });
      testResults.leagues = {
        success: true,
        count: leaguesResponse?.data?.length || 0,
        data: leaguesResponse?.data?.slice(0, 3) || []
      };
    } catch (error) {
      testResults.errors.push(`Leagues API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test countries API
    try {
      const countriesResponse = await sportmonks.getCountries({
        per_page: 10,
        page: 1
      });
      testResults.countries = {
        success: true,
        count: countriesResponse?.data?.length || 0,
        data: countriesResponse?.data?.slice(0, 3) || []
      };
    } catch (error) {
      testResults.errors.push(`Countries API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test fixtures API
    try {
      const today = new Date().toISOString().split('T')[0];
      const fixturesResponse = await sportmonks.getFixturesByDate(today, {
        per_page: 10,
        page: 1
      });
      testResults.fixtures = {
        success: true,
        count: fixturesResponse?.data?.length || 0,
        data: fixturesResponse?.data?.slice(0, 3) || []
      };
    } catch (error) {
      testResults.errors.push(`Fixtures API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

  } catch (error) {
    testResults.errors.push(`General Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">SportMonks API Test</h1>
      
      <div className="space-y-6">
        {/* Environment Variables */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <div><strong>SPORTMONKS_BASE_URL:</strong> {process.env.SPORTMONKS_BASE_URL || 'Not set'}</div>
            <div><strong>SPORTMONKS_API_TOKEN:</strong> {process.env.SPORTMONKS_API_TOKEN ? 'Set (hidden)' : 'Not set'}</div>
          </div>
        </div>

        {/* API Test Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">API Test Results</h2>
          
          {/* Leagues */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Leagues API</h3>
            {testResults.leagues ? (
              <div className="text-sm">
                <div><strong>Status:</strong> ✅ Success</div>
                <div><strong>Count:</strong> {testResults.leagues.count}</div>
                <div><strong>Sample Data:</strong></div>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(testResults.leagues.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-red-600">❌ Failed</div>
            )}
          </div>

          {/* Countries */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Countries API</h3>
            {testResults.countries ? (
              <div className="text-sm">
                <div><strong>Status:</strong> ✅ Success</div>
                <div><strong>Count:</strong> {testResults.countries.count}</div>
                <div><strong>Sample Data:</strong></div>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(testResults.countries.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-red-600">❌ Failed</div>
            )}
          </div>

          {/* Fixtures */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Fixtures API</h3>
            {testResults.fixtures ? (
              <div className="text-sm">
                <div><strong>Status:</strong> ✅ Success</div>
                <div><strong>Count:</strong> {testResults.fixtures.count}</div>
                <div><strong>Sample Data:</strong></div>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(testResults.fixtures.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-red-600">❌ Failed</div>
            )}
          </div>
        </div>

        {/* Errors */}
        {testResults.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-red-800 mb-3">Errors</h2>
            <div className="space-y-2">
              {testResults.errors.map((error, index) => (
                <div key={index} className="text-red-700 text-sm">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Links */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">Test Country Links</h2>
          <div className="space-y-2">
            <a 
              href="/predictions/country/brazil?id=5" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              Test Brazil: /predictions/country/brazil?id=5
            </a>
            <a 
              href="/predictions/country/argentina?id=44" 
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              Test Argentina: /predictions/country/argentina?id=44
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
