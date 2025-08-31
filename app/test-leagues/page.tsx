import { sportmonks } from '@/lib/sportmonks';

export default async function TestLeaguesPage() {
  try {
    // Get leagues using the new optimized endpoints
    const [allLeagues, liveLeagues, todayLeagues] = await Promise.all([
      sportmonks.getLeagues({ include: 'country;sport', per_page: 50, page: 1 }),
      sportmonks.getLeaguesByLive({ include: 'country;sport', per_page: 50, page: 1 }),
      sportmonks.getLeaguesByFixtureDate(new Date().toISOString().split('T')[0], { include: 'country;sport', per_page: 50, page: 1 })
    ]);

    const leagues = allLeagues?.data || [];
    const liveLeaguesData = liveLeagues?.data || [];
    const todayLeaguesData = todayLeagues?.data || [];

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">League Endpoints Test Page</h1>
        
        {/* API Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">All Leagues</h3>
            <p className="text-green-600">{leagues.length} leagues found</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800">Live Leagues</h3>
            <p className="text-blue-600">{liveLeaguesData.length} live leagues</p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800">Today's Leagues</h3>
            <p className="text-purple-600">{todayLeaguesData.length} leagues with fixtures today</p>
          </div>
        </div>

        <p className="mb-4">
          This page tests the new league endpoints and shows available leagues from SportMonks API.
          Use these IDs to test league routes and verify the 404 fixes.
        </p>
        
        {/* All Leagues */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">All Leagues (First 50)</h2>
          <div className="grid gap-4">
            {leagues.map((league) => (
              <div key={league.id} className="border p-4 rounded-lg">
                <h3 className="font-semibold">
                  {league.name} (ID: {league.id})
                </h3>
                <div className="text-sm text-gray-600 mt-2">
                  <div><strong>Country:</strong> {league.country?.name || 'Unknown'}</div>
                  <div><strong>Type:</strong> {league.type || 'Unknown'}</div>
                  <div><strong>Active:</strong> {league.active ? 'Yes' : 'No'}</div>
                  <div><strong>Sport:</strong> {league.sport?.name || 'Unknown'}</div>
                </div>
                
                {/* Test links */}
                <div className="mt-3 flex gap-2">
                  <a 
                    href={`/predictions/league/${league.id}`} 
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Test League Route
                  </a>
                  <a 
                    href={`/predictions/country/${league.country?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}?id=${league.country?.id}`}
                    className="text-green-600 hover:text-green-800 underline text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Test Country Route
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Leagues */}
        {liveLeaguesData.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Live Leagues</h2>
            <div className="grid gap-4">
              {liveLeaguesData.slice(0, 10).map((league) => (
                <div key={league.id} className="border p-4 rounded-lg bg-yellow-50">
                  <h3 className="font-semibold">
                    🔴 LIVE: {league.name} (ID: {league.id})
                  </h3>
                  <div className="text-sm text-gray-600 mt-2">
                    <div><strong>Country:</strong> {league.country?.name || 'Unknown'}</div>
                    <div><strong>Type:</strong> {league.type || 'Unknown'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Leagues */}
        {todayLeaguesData.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Today's Leagues (with fixtures)</h2>
            <div className="grid gap-4">
              {todayLeaguesData.slice(0, 10).map((league) => (
                <div key={league.id} className="border p-4 rounded-lg bg-green-50">
                  <h3 className="font-semibold">
                    📅 TODAY: {league.name} (ID: {league.id})
                  </h3>
                  <div className="text-sm text-gray-600 mt-2">
                    <div><strong>Country:</strong> {league.country?.name || 'Unknown'}</div>
                    <div><strong>Type:</strong> {league.type || 'Unknown'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Testing Instructions */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Testing Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Test League Routes:</strong> Click on any "Test League Route" link above to verify league pages load without 404 errors</li>
            <li><strong>Test Country Routes:</strong> Click on any "Test Country Route" link to verify country prediction pages work</li>
            <li><strong>Check Console:</strong> Open browser console to see debug messages from the new league endpoints</li>
            <li><strong>Verify Performance:</strong> Notice faster loading times due to direct league ID endpoints</li>
            <li><strong>Test Sidebar:</strong> Navigate to the sidebar and expand countries to see leagues loading</li>
          </ol>
          
          <div className="mt-4 p-4 bg-white rounded border">
            <h3 className="font-semibold mb-2">Expected Improvements:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>✅ League pages should load instantly (no more pagination searching)</li>
              <li>✅ Sidebar should show real-time league data</li>
              <li>✅ Better error handling and user feedback</li>
              <li>✅ Optimized API calls using dedicated endpoints</li>
              <li>✅ Improved caching and performance</li>
            </ul>
          </div>
        </div>

        {/* API Endpoint Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">New League Endpoints Used:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>getLeagues()</strong> - All leagues with pagination
            </div>
            <div>
              <strong>getLeaguesByLive()</strong> - Currently live leagues
            </div>
            <div>
              <strong>getLeaguesByFixtureDate()</strong> - Leagues with fixtures on specific date
            </div>
            <div>
              <strong>getLeaguesById()</strong> - Direct league lookup by ID (used in league pages)
            </div>
            <div>
              <strong>getLeaguesByCountryId()</strong> - Leagues for specific country (used in sidebar)
            </div>
            <div>
              <strong>getLeaguesBySearch()</strong> - Search leagues by name
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">League Test Error</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">
            Error loading leagues: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <p className="text-sm text-red-600 mt-2">
            This indicates an issue with the SportMonks API connection or the new endpoints.
          </p>
          <div className="mt-4 p-3 bg-white rounded border">
            <h3 className="font-semibold mb-2">Troubleshooting:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Check your SportMonks API token in .env.local</li>
              <li>Verify the API base URL is correct</li>
              <li>Check browser console for detailed error messages</li>
              <li>Test the health endpoint: <code>/api/sportmonks/health</code></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
