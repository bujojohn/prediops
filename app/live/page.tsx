import { sportmonks } from '@/lib/sportmonks';
import { LiveMatchCard } from '../components/live-matches/LiveMatchCard';
import type { Fixture } from '@/schemas/fixture.schema';

export default async function LiveMatchesPage() {
  // Server-side data fetching with App Router
  const liveFixtures: { data: Fixture[] } = await sportmonks.getLiveFixtures();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live Matches</h1>
        <p className="text-gray-600">
          Real-time scores and match updates from around the world
        </p>
      </div>
      
      {liveFixtures?.data?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveFixtures.data.map((liveMatch) => (
            <LiveMatchCard 
              key={liveMatch.id} 
              liveMatch={liveMatch} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">⚽</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No live matches currently
          </h3>
          <p className="text-gray-500">
            Check back later for live match updates
          </p>
        </div>
      )}
    </div>
  );
} 