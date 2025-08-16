import { sportmonks } from '@/lib/sportmonks';
import type { Fixture } from '@/schemas/fixture.schema';
import { LatestFixturesClient } from './LatestFixturesClient';

export default async function PredictionsPage() {
  // Server-side data fetching: upcoming fixtures for today with predictions
  const upcoming = await sportmonks.getUpcomingFixtures({
    include: 'participants;scores;state;predictions.type;league.country;events',
    sortBy: 'starting_at',
    filters: 'todayDate',
    order: 'desc',
    per_page: 50,
    page: 1,
  });
  const fixtures: Fixture[] = upcoming?.data || [];
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">All Football Events</h1>
        <span className="text-sm text-gray-600">
          AI-powered predictions for upcoming matches
        </span>
      </div>
      
      <LatestFixturesClient initialFixtures={fixtures} />
    </div>
  );
} 