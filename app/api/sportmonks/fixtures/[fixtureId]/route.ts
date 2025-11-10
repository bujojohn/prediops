import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import type { Fixture } from '@/schemas/fixture.schema';

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
 * GET /api/sportmonks/fixtures/[fixtureId]
 * 
 * Fetches detailed fixture information including:
 * - Basic fixture info (participants, scores, state, league)
 * - Statistics (if match is live or finished)
 * - Lineups (if available)
 * - Events (goals, cards, substitutions)
 * - Predictions (if available)
 * - Odds (if available)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  try {
    const { fixtureId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Determine what data to include based on query params
    const include = searchParams.get('include') || 
      'participants;scores;state;league.country;league.sport;round.stage;events.type;events.period;events.player;predictions.type;periods.type';
    
    const includeStats = searchParams.get('stats') === 'true';
    const includeLineups = searchParams.get('lineups') === 'true';
    const includeOdds = searchParams.get('odds') === 'true';

    console.log(`Fetching fixture ${fixtureId} with includes: ${include}`);

    // Fetch main fixture data
    const fixtureResponse = await sportmonks.getFixturesById(fixtureId, {
      include,
      per_page: 1,
    });

    const fixtures = extractFixtureArray(fixtureResponse as unknown);
    const fixture = fixtures[0];

    if (!fixture) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fixture not found',
        },
        { status: 404 }
      );
    }

    // Fetch additional data in parallel if requested
    const [statistics, lineups, odds] = await Promise.allSettled([
      includeStats && fixture.state_id
        ? sportmonks.getFixtureStatistics(fixtureId, {
            include: 'participant;type',
          }).catch(() => null)
        : Promise.resolve(null),
      includeLineups
        ? sportmonks.getFixtureLineupsById(fixtureId, {
            include: 'player;position;formation',
          }).catch(() => null)
        : Promise.resolve(null),
      includeOdds
        ? sportmonks.getOddsByFixtureId(fixtureId, {
            include: 'bookmaker;market',
          }).catch(() => null)
        : Promise.resolve(null),
    ]);

    const result: {
      success: boolean;
      fixture: Fixture;
      statistics?: unknown;
      lineups?: unknown;
      odds?: unknown;
      timestamp: string;
    } = {
      success: true,
      fixture,
      timestamp: new Date().toISOString(),
    };

    if (statistics.status === 'fulfilled' && statistics.value) {
      result.statistics = statistics.value;
    }

    if (lineups.status === 'fulfilled' && lineups.value) {
      result.lineups = lineups.value;
    }

    if (odds.status === 'fulfilled' && odds.value) {
      result.odds = odds.value;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching fixture:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch fixture',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


