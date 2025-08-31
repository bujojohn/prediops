import { sportmonks } from '@/lib/sportmonks';

export default async function TestLeagueRoute() {
  const testLeagueId = '1631';
  
  try {
    console.log(`Testing league ID: ${testLeagueId}`);
    
    // Test the getLeaguesById endpoint
    const leagueResponse = await sportmonks.getLeaguesById(testLeagueId, {
      include: 'country;sport'
    });

    const league = leagueResponse?.data?.[0];
    
    if (league) {
      console.log(`Found league: ${league.name} (ID: ${league.id})`);
    } else {
      console.log(`League not found: ID=${testLeagueId}`);
    }

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">League Route Test</h1>
        
        <div className="space-y-4">
          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Test League ID: {testLeagueId}</h2>
            
            {league ? (
              <div>
                <p><strong>League Name:</strong> {league.name}</p>
                <p><strong>League ID:</strong> {league.id}</p>
                <p><strong>Country:</strong> {league.country?.name || 'Unknown'}</p>
                <p><strong>Active:</strong> {league.active ? 'Yes' : 'No'}</p>
                
                <div className="mt-4">
                  <a 
                    href={`/predictions/league/${league.id}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Test League Route
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-red-600">League not found!</p>
                <p>This league ID might not exist in the SportMonks API.</p>
              </div>
            )}
          </div>

          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Test Available Leagues</h2>
            <p>Let's check what leagues are actually available:</p>
            
            <div className="mt-4">
              <a 
                href="/test-leagues"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Available Leagues
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error testing league route:', error);
    
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">League Route Test</h1>
        
        <div className="border p-4 rounded-lg bg-red-50">
          <h2 className="text-lg font-semibold mb-2 text-red-600">Error Testing League Route</h2>
          <p className="text-red-600">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
