import { notFound } from 'next/navigation';
import { LeagueClient } from './league-client';

// Mock data - replace with actual API call
const getLeagueData = async (id: string) => {
  const leagues = {
    '1': {
      id: 1,
      name: 'Premier League',
      country: 'England',
      season: '2024/25',
      image_path: '/leagues/premier-league.png',
      fixture_count: 380,
      team_count: 20
    },
    '2': {
      id: 2,
      name: 'La Liga',
      country: 'Spain',
      season: '2024/25',
      image_path: '/leagues/la-liga.png',
      fixture_count: 380,
      team_count: 20
    }
  };

  return leagues[id as keyof typeof leagues] || null;
};

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const league = await getLeagueData(id);

  if (!league) {
    notFound();
  }

  return <LeagueClient league={league} />;
}