import { sportmonks } from '@/lib/sportmonks';
import { LiveMatchesList } from './components/LiveMatchesList';
import type { Fixture } from '@/schemas/fixture.schema';

export default async function LiveMatchesPage() {
  try {
    // Fetch data on the server
    const liveFixturesResponse = await sportmonks.getLiveFixtures();
    const liveFixtures = liveFixturesResponse?.data || [];
    
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Matches</h1>
          <p className="text-gray-600">
            Real-time scores and match updates from around the world
          </p>
        </div>
        
        <LiveMatchesList initialFixtures={liveFixtures} />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch live fixtures:', error);
    
    // Return error state
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Matches</h1>
          <p className="text-gray-600">
            Real-time scores and match updates from around the world
          </p>
        </div>
        
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            Failed to load live matches. Please try again later.
          </div>
        </div>
      </div>
    );
  }
} 