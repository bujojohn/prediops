import { sportmonks } from '@/lib/sportmonks';
import type { Fixture } from '@/schemas/fixture.schema';
import { LatestFixturesClient } from './LatestFixturesClient';

export default async function PredictionsPage() {
  // Server-side data fetching per spec 3.1.1 (livescores/latest with predictions)
  const latest = await sportmonks.getLatestLiveScores({
    include: 'participants;scores;state;predictions;league',
    sortBy: 'starting_at',
    order: 'desc',
    per_page: 50,
  });
  //console.log(latest);
  const fixtures: Fixture[] = latest?.data || [];
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Match Predictions</h1>
        <p className="text-gray-600">
          AI-powered predictions for upcoming matches across 111+ leagues worldwide
        </p>
      </div>
      
      <LatestFixturesClient initialFixtures={fixtures} />
    </div>
  );
} 