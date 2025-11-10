import { notFound } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import type { Fixture } from '@/schemas/fixture.schema';
import { FixtureDetailClient } from './FixtureDetailClient';

interface FixturePageProps {
  params: Promise<{
    fixtureId: string;
    slug: string;
  }>;
}

function extractFixtureArray(response: unknown): Fixture[] {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response as Fixture[];
  }

  const outer = response as { data?: unknown };
  if (Array.isArray(outer.data)) {
    return outer.data as Fixture[];
  }

  if (outer.data) {
    const nested = outer.data as { data?: unknown };
    if (Array.isArray(nested.data)) {
      return nested.data as Fixture[];
    }
    if (nested.data && typeof nested.data === 'object') {
      return [nested.data as Fixture];
    }
    return [outer.data as Fixture];
  }

  return [];
}

/**
 * Fixture Detail Page
 * 
 * Displays comprehensive information about a single football fixture:
 * - Match header with teams, score, and status
 * - Match timeline (events)
 * - Statistics
 * - Lineups
 * - Predictions
 * - Head-to-head (if available)
 */
export default async function FixturePage({ params }: FixturePageProps) {
  const { fixtureId } = await params;

  try {
    // Fetch fixture with essential data
    const fixtureResponse = await sportmonks.getFixturesById(fixtureId, {
      include: 'participants;scores;state;league.country;league.sport;round.stage;events.type;events.period;events.player;predictions.type;periods.type',
      per_page: 1,
    });

    const fixtures = extractFixtureArray(fixtureResponse as unknown);
    const fixture = fixtures[0];

    if (!fixture) {
      notFound();
    }

    // Fetch additional data in parallel
    const [statisticsResponse, lineupsResponse, oddsResponse] = await Promise.allSettled([
      // Statistics - only fetch if match is live or finished
      fixture.state?.name && ['inprogress', 'finished', 'ft'].includes(fixture.state.name.toLowerCase())
        ? sportmonks.getFixtureStatistics(fixtureId, {
            include: 'participant;type',
          }).catch(() => null)
        : Promise.resolve(null),
      // Lineups - fetch if available
      sportmonks.getFixtureLineupsById(fixtureId, {
        include: 'player;position;formation',
      }).catch(() => null),
      // Odds - fetch if available
      sportmonks.getOddsByFixtureId(fixtureId, {
        include: 'bookmaker;market',
      }).catch(() => null),
    ]);

    const statistics = statisticsResponse.status === 'fulfilled' ? statisticsResponse.value : null;
    const lineups = lineupsResponse.status === 'fulfilled' ? lineupsResponse.value : null;
    const odds = oddsResponse.status === 'fulfilled' ? oddsResponse.value : null;

    return (
      <FixtureDetailClient
        fixture={fixture}
        statistics={statistics}
        lineups={lineups}
        odds={odds}
      />
    );
  } catch (error) {
    console.error('Error loading fixture page:', error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: FixturePageProps) {
  const { fixtureId } = await params;
  
  try {
    const fixtureResponse = await sportmonks.getFixturesById(fixtureId, {
      include: 'participants;state;league.country',
      per_page: 1,
    });

    const fixtures = extractFixtureArray(fixtureResponse as unknown);
    const fixture = fixtures[0];

    if (!fixture) {
      return {
        title: 'Fixture Not Found | Prediops',
      };
    }

    const homeParticipant = fixture.participants?.find(p => p.meta?.location === 'home') || null;
    const awayParticipant = fixture.participants?.find(p => p.meta?.location === 'away') || null;

    const homeTeam = homeParticipant?.name || 'Team 1';
    const awayTeam = awayParticipant?.name || 'Team 2';
    const leagueName = fixture.league?.name || 'Football Match';
    const countryName = fixture.league?.country?.name || '';
    const matchStatus = fixture.state?.name || 'Not Started';
    
    // Format date
    const dateStr = fixture.starting_at 
      ? new Date(fixture.starting_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : '';

    // Generate score string if match is live or finished
    let scoreStr = '';
    if (fixture.scores && fixture.scores.length > 0) {
      const homeScore = fixture.scores.find(
        (s) => s.description === 'CURRENT' && s.participant_id === homeParticipant?.id
      )?.score?.goals ?? 0;
      const awayScore = fixture.scores.find(
        (s) => s.description === 'CURRENT' && s.participant_id === awayParticipant?.id
      )?.score?.goals ?? 0;
      scoreStr = `${homeScore} - ${awayScore}`;
    }

    const title = scoreStr 
      ? `${homeTeam} ${scoreStr} ${awayTeam} - ${leagueName} | Prediops`
      : `${homeTeam} vs ${awayTeam} - ${leagueName}${countryName ? ` (${countryName})` : ''} | Prediops`;
    
    const description = scoreStr
      ? `Live: ${homeTeam} ${scoreStr} ${awayTeam} in ${leagueName}. ${matchStatus}.`
      : `${homeTeam} vs ${awayTeam} in ${leagueName}${countryName ? `, ${countryName}` : ''}. ${dateStr ? `Match scheduled for ${dateStr}.` : ''}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Fixture | Prediops',
    };
  }
}


