import { sportmonks } from '@/lib/sportmonks';

export default async function TestActiveLeagues() {
  try {
    // Test getting leagues for a specific country (Poland - ID: 2)
    const countryId = '2';
    
    console.log(`Testing active leagues for country ID: ${countryId}`);
    
    // Get leagues using the getLeaguesByCountryId endpoint
    const leaguesResponse = await sportmonks.getLeaguesByCountryId(countryId, {
      include: 'country;sport;currentseason',
      per_page: 50,
      page: 1
    });

    const allLeagues = leaguesResponse?.data || [];
    const activeLeagues = allLeagues.filter((league: any) => league.active === true);
    const inactiveLeagues = allLeagues.filter((league: any) => league.active !== true);

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Active Leagues Test</h1>
        
        <div className="space-y-6">
          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Country: Poland (ID: {countryId})</h2>
            <p><strong>Total Leagues:</strong> {allLeagues.length}</p>
            <p><strong>Active Leagues:</strong> {activeLeagues.length}</p>
            <p><strong>Inactive Leagues:</strong> {inactiveLeagues.length}</p>
          </div>

          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Active Leagues ({activeLeagues.length})</h2>
            {activeLeagues.length > 0 ? (
              <div className="space-y-2">
                {activeLeagues.map((league: any) => (
                  <div key={league.id} className="p-2 bg-green-50 rounded">
                    <p><strong>{league.name}</strong> (ID: {league.id})</p>
                    <p className="text-sm text-gray-600">Active: {league.active ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-gray-600">Short Code: {league.short_code || 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No active leagues found</p>
            )}
          </div>

          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Inactive Leagues ({inactiveLeagues.length})</h2>
            {inactiveLeagues.length > 0 ? (
              <div className="space-y-2">
                {inactiveLeagues.slice(0, 10).map((league: any) => (
                  <div key={league.id} className="p-2 bg-red-50 rounded">
                    <p><strong>{league.name}</strong> (ID: {league.id})</p>
                    <p className="text-sm text-gray-600">Active: {league.active ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-gray-600">Short Code: {league.short_code || 'N/A'}</p>
                  </div>
                ))}
                {inactiveLeagues.length > 10 && (
                  <p className="text-sm text-gray-500">... and {inactiveLeagues.length - 10} more inactive leagues</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No inactive leagues found</p>
            )}
          </div>

          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Test API Route</h2>
            <p>Test the API route that the sidebar uses:</p>
            <div className="mt-2">
              <a 
                href={`/api/sportmonks/leagues/country/${countryId}`}
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Test API Route for Country {countryId}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error testing active leagues:', error);
    
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Active Leagues Test</h1>
        
        <div className="border p-4 rounded-lg bg-red-50">
          <h2 className="text-lg font-semibold mb-2 text-red-600">Error Testing Active Leagues</h2>
          <p className="text-red-600">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
