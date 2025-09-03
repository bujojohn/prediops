import { sportmonks } from '@/lib/sportmonks';
import type { Fixture } from '@/schemas/fixture.schema';
import { LiveFixturesClient } from './components/LiveFixturesClient';

export default async function LiveMatchesPage() {
  try {
    // Fetch data on the server with required includes per spec
    const liveFixturesResponse = await sportmonks.getLiveFixtures(
      {include: 'participants;scores;state;predictions.type;league.country',
        sortBy: 'starting_at',
        order: 'desc',
        per_page:50,
        page:1}
    );
    const liveFixtures: Fixture[] = liveFixturesResponse?.data || [];
   // console.log(liveFixtures);

    
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Matches</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Real-time scores and match updates from around the world
          </p>
        </div>
        <LiveFixturesClient initialFixtures={liveFixtures} />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch live fixtures:', error);
    
    // Return error state
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Matches</h1>
          <p className="text-gray-700 dark:text-gray-300">
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