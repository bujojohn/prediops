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
    const fixturesResponse = await sportmonks.getFixturesByDate(today, {
      include: 'league.country',
      per_page: 50,
      page: 1,
    });

    const todayFixtures = fixturesResponse?.data || [];
    
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
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch countries with available leagues',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
