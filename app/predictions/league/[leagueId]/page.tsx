import { notFound } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
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

    // Get all fixtures for this league (next 7 days)
    const today = new Date();
    const fixturesPromises = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      fixturesPromises.push(
        sportmonks.getFixturesByDate(dateString, {
          include: 'participants;scores;state;predictions.type;league.country',
          per_page: 100,
          page: 1,
        })
      );
    }

    const fixturesResponses = await Promise.all(fixturesPromises);
    
    let allFixtures: Fixture[] = [];
    fixturesResponses.forEach(response => {
      const fixtures = response?.data || [];
      const leagueFixtures = fixtures.filter((fixture: Fixture) => {
        const fixtureLeagueId = fixture.league?.id?.toString();
        return fixtureLeagueId === leagueId;
      });
      allFixtures = [...allFixtures, ...leagueFixtures];
    });

    console.log(`Found ${allFixtures.length} total fixtures for league ${league.name} in next 7 days`);

    return (
      <LeaguePredictionsClient 
        league={league}
        fixtures={allFixtures}
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
