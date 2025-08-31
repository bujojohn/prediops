import { notFound } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { getCountries, getCountryById } from '@/lib/data/countries';
import { Country } from '@/schemas/country.schema';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { CountryPredictionsClient } from './country-predictions-client';
import { findCountryBySlug } from '@/lib/utils/country-utils';

interface CountryPredictionsPageProps {
  params: Promise<{
    countrySlug: string;
  }>;
  searchParams: Promise<{
    id?: string;
    league?: string;
  }>;
}

export default async function CountryPredictionsPage({ 
  params, 
  searchParams 
}: CountryPredictionsPageProps) {
  const { countrySlug } = await params;
  const { id: countryId, league: leagueId } = await searchParams;

  try {
    // Find country by slug or ID
    let country: Country | undefined;
    
    if (countryId) {
      // If ID is provided, use it directly
      country = getCountryById(parseInt(countryId));
    } else {
      // Otherwise, search by slug using utility function
      const allCountries = getCountries();
      country = findCountryBySlug(allCountries, countrySlug);
    }

    if (!country) {
      console.error(`Country not found: slug=${countrySlug}, id=${countryId}`);
      notFound();
    }

    console.log(`Loading data for country: ${country.name} (ID: ${country.id})`);

    // Get leagues for this country with better error handling
    let countryLeagues: unknown[] = [];
    try {
      const leaguesResponse = await sportmonks.getLeagues({
        include: 'country;sport;currentseason',
        per_page: 50,
        page: 1
      });

      const allLeagues = leaguesResponse?.data || [];
      countryLeagues = allLeagues.filter((league) => {
        const leagueData = league as { country_id?: number; country?: { id: number }; active?: boolean };
        return (leagueData.country_id?.toString() === country.id.toString() || 
                leagueData.country?.id?.toString() === country.id.toString()) &&
               leagueData.active === true;
      });

      console.log(`Found ${countryLeagues.length} leagues for ${country.name}`);
    } catch (leaguesError) {
      console.error(`Error loading leagues for ${country.name}:`, leaguesError);
      // Continue with empty leagues array instead of failing completely
    }

    // Sort leagues by name
    const sortedLeagues = countryLeagues.sort((a, b) => {
      const nameA = (a as { name?: string }).name?.toLowerCase() || '';
      const nameB = (b as { name?: string }).name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });

    // Get today's fixtures for this country with better error handling
    let countryFixtures: unknown[] = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      const fixturesResponse = await sportmonks.getFixturesByDate(today, {
        include: 'participants;scores;state;predictions.type;league.country',
        per_page: 50,
        page: 1,
      });

      const allFixtures = fixturesResponse?.data || [];
      countryFixtures = allFixtures.filter((fixture: unknown) => {
        return (fixture as { league?: { country?: { id: number } } }).league?.country?.id === country.id;
      });

      console.log(`Found ${countryFixtures.length} fixtures for ${country.name} today`);
    } catch (fixturesError) {
      console.error(`Error loading fixtures for ${country.name}:`, fixturesError);
      // Continue with empty fixtures array instead of failing completely
    }

    // Filter by specific league if provided
    const filteredFixtures = leagueId 
      ? countryFixtures.filter((fixture: unknown) => (fixture as { league?: { id: number } }).league?.id?.toString() === leagueId)
      : countryFixtures;

    return (
      <CountryPredictionsClient 
        country={country}
        leagues={sortedLeagues as League[]}
        fixtures={filteredFixtures as Fixture[]}
      />
    );
  } catch (error) {
    console.error('Critical error loading country predictions:', error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ countrySlug: string }> }) {
  const { countrySlug } = await params;
  
  // Find country by slug using utility function
  const allCountries = getCountries();
  const country = findCountryBySlug(allCountries, countrySlug);

  if (!country) {
    return {
      title: 'Country Not Found',
      description: 'The requested country could not be found.'
    };
  }

  return {
    title: `${country.name} Predictions & Fixtures | Prediops`,
    description: `Get AI-powered predictions, live scores, and fixtures for ${country.name}. View leagues, matches, and betting opportunities.`,
    keywords: `${country.name}, football predictions, live scores, fixtures, leagues, betting, ${country.fifa_name || ''}`,
  };
}
