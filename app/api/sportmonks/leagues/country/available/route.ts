import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { getCountries } from '@/lib/data/countries';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';

export async function GET() {
  try {
    // Get all leagues from SportMonks - fetch multiple pages to get all leagues
    let allLeagues: League[] = [];
    let currentPage = 1;
    let hasMorePages = true;
    
    while (hasMorePages && currentPage <= 10) { // Limit to 10 pages to avoid infinite loops
      const leaguesResponse = await sportmonks.getLeagues({
        include: 'country',
        per_page: 50,
        page: currentPage
      });

      const pageLeagues = leaguesResponse?.data || [];
      allLeagues = [...allLeagues, ...pageLeagues];
      
      // Check if there are more pages
      hasMorePages = pageLeagues.length === 50 && (leaguesResponse?.pagination?.has_more || false);
      currentPage++;
    }
    
    // Get unique country IDs that have leagues
    const countryIdsWithLeagues = new Set<number>();
    
    allLeagues.forEach((league: League) => {
      if (league.country_id) {
        countryIdsWithLeagues.add(league.country_id);
      } else if (league.country?.id) {
        countryIdsWithLeagues.add(league.country.id);
      }
    });

    // Get today's date for fixture counting
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's fixtures to count per country and league
    let todayFixtures: Fixture[] = [];
    try {
      const fixturesResponse = await sportmonks.getFixturesByDate(today, {
        include: 'league.country',
        per_page: 50,
        page: 1,
      });
      todayFixtures = fixturesResponse?.data || [];
    } catch (fixtureError) {
      console.warn('Could not fetch today\'s fixtures, continuing with empty fixtures:', fixtureError);
      // Continue with empty fixtures - this is not a critical error
    }
    
    // Count fixtures per country
    const countryFixtureCounts: Record<number, number> = {};
    const leagueFixtureCounts: Record<number, number> = {};
    
    todayFixtures.forEach((fixture: Fixture) => {
      const countryId = fixture.league?.country?.id;
      const leagueId = fixture.league?.id;
      
      if (countryId) {
        countryFixtureCounts[countryId] = (countryFixtureCounts[countryId] || 0) + 1;
      }
      
      if (leagueId) {
        leagueFixtureCounts[leagueId] = (leagueFixtureCounts[leagueId] || 0) + 1;
      }
    });

    // Get all countries from local data
    const allCountries = getCountries();
    
    // Filter countries that have leagues
    const countriesWithLeagues = allCountries.filter(country => 
      countryIdsWithLeagues.has(country.id)
    );

    // Add fixture counts to countries
    const countriesWithFixtureCounts = countriesWithLeagues.map(country => ({
      ...country,
      fixtureCount: countryFixtureCounts[country.id] || 0
    }));

    // Sort countries by name
    const sortedCountries = countriesWithFixtureCounts.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });

    // If no countries with leagues found, return a user-friendly message
    if (sortedCountries.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          countries: [],
          totalCountries: allCountries.length,
          countriesWithLeagues: 0,
          leaguesCount: allLeagues.length,
          leagueFixtureCounts: {},
          message: 'No scheduled fixtures found for today'
        },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        countries: sortedCountries,
        totalCountries: allCountries.length,
        countriesWithLeagues: sortedCountries.length,
        leaguesCount: allLeagues.length,
        leagueFixtureCounts
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Available Countries API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's an API authentication error
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid token')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'API authentication failed',
          message: 'No scheduled fixtures found - please check your SportMonks API configuration',
          details: 'Invalid or missing API token'
        },
        { status: 401 }
      );
    }
    
    // Check if it's a rate limit or service error
    if (errorMessage.includes('429') || errorMessage.includes('Rate limit') || errorMessage.includes('Service unavailable')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Service temporarily unavailable',
          message: 'No scheduled fixtures found - please try again later',
          details: 'API rate limit exceeded or service unavailable'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch countries with available leagues',
        message: 'No scheduled fixtures found - please try again later',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
