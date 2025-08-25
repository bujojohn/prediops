import { notFound } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { LeaguePredictionsClient } from './league-predictions-client';

interface LeaguePredictionsPageProps {
  params: Promise<{
    leagueId: string;
  }>;
}

export default async function LeaguePredictionsPage({ 
  params 
}: LeaguePredictionsPageProps) {
  const { leagueId } = await params;

  try {
    // Get league details
    const leagueResponse = await sportmonks.getLeagues({
      include: 'country;sport;currentseason',
      per_page: 50,
      page: 1
    });

    const allLeagues = leagueResponse?.data || [];
    const league = allLeagues.find((l: any) => l.id?.toString() === leagueId);

    if (!league) {
      notFound();
    }

    // Get today's fixtures for this league
    const today = new Date().toISOString().split('T')[0];
    
    const fixturesResponse = await sportmonks.getFixturesByDate(today, {
      include: 'participants;scores;state;predictions.type;league.country',
      per_page: 100,
      page: 1,
    });

    const allFixtures = fixturesResponse?.data || [];
    
    const leagueFixtures = allFixtures.filter((fixture: any) => {
      const fixtureLeagueId = fixture.league?.id?.toString();
      return fixtureLeagueId === leagueId;
    });

    return (
      <LeaguePredictionsClient 
        league={league}
        fixtures={leagueFixtures}
      />
    );
  } catch (error) {
    console.error('Error loading league predictions:', error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ leagueId: string }> }) {
  const { leagueId } = await params;
  
  try {
    const leagueResponse = await sportmonks.getLeagues({
      include: 'country;sport',
      per_page: 50,
      page: 1
    });

    const allLeagues = leagueResponse?.data || [];
    const league = allLeagues.find((l: any) => l.id?.toString() === leagueId);

    if (!league) {
      return {
        title: 'League Not Found',
        description: 'The requested league could not be found.'
      };
    }

    const leagueName = league.name || 'Unknown League';
    const countryName = league.country?.name || '';

    return {
      title: `${leagueName} Predictions & Fixtures | Prediops`,
      description: `Get AI-powered predictions, live scores, and fixtures for ${leagueName}${countryName ? ` in ${countryName}` : ''}. View matches and betting opportunities.`,
      keywords: `${leagueName}, ${countryName}, football predictions, live scores, fixtures, betting, ${league.short_code || ''}`,
    };
  } catch (error) {
    return {
      title: 'League Predictions | Prediops',
      description: 'Get AI-powered predictions and live scores for football leagues.'
    };
  }
}
