import { notFound } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';

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

  console.log(`=== League Predictions Page Debug ===`);
  console.log(`League ID:`, leagueId);

  try {
    // Use the new dedicated endpoint for getting league by ID
    const leagueResponse = await sportmonks.getLeaguesById(leagueId, {
      include: 'country;sport;stages;seasons;currentseason'
    });

    const league = leagueResponse?.data?.[0]; // getLeaguesById returns an array with one item

    if (!league) {
      console.error(`League not found: ID=${leagueId}`);
      notFound();
    }

    console.log(`Found league: ${league.name} (ID: ${league.id})`);

    // Get today's fixtures for this league
    const today = new Date().toISOString().split('T')[0];
    
    const fixturesResponse = await sportmonks.getFixturesByDate(today, {
      include: 'participants;scores;state;predictions.type;league.country',
      per_page: 100,
      page: 1,
    });

    const allFixtures = fixturesResponse?.data || [];
    
    const leagueFixtures = allFixtures.filter((fixture: { league?: { id?: number } }) => {
      const fixtureLeagueId = fixture.league?.id?.toString();
      return fixtureLeagueId === leagueId;
    });

    console.log(`Found ${leagueFixtures.length} fixtures for league ${league.name}`);

    return (
      <LeaguePredictionsClient 
        league={league}
        fixtures={leagueFixtures}
      />
    );
  } catch (error) {
    console.error('Error loading league data:', error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ leagueId: string }> }) {
  const { leagueId } = await params;
  
  try {
    // Use the new dedicated endpoint for getting league by ID
    const leagueResponse = await sportmonks.getLeaguesById(leagueId, {
      include: 'country;sport'
    });

    const league = leagueResponse?.data?.[0]; // getLeaguesById returns an array with one item

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
    console.error('Error generating metadata for league:', error);
    return {
      title: 'League Predictions | Prediops',
      description: 'Get AI-powered predictions and live scores for football leagues.'
    };
  }
}
