import { notFound } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { getCountries, searchCountries, getCountryById } from '@/lib/data/countries';
import { Country } from '@/schemas/country.schema';
import { League } from '@/schemas/league.schema';
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
      notFound();
    }

    // Get leagues for this country
    const leaguesResponse = await sportmonks.getLeagues({
      include: 'country;sport;currentseason',
      per_page: 1000,
      page: 1
    });

    const allLeagues = leaguesResponse?.data || [];
    const countryLeagues = allLeagues.filter((league: any) => {
      return league.country_id?.toString() === country.id.toString() || 
             league.country?.id?.toString() === country.id.toString();
    });

    // Sort leagues by name
    const sortedLeagues = countryLeagues.sort((a: any, b: any) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });

    // Get today's fixtures for this country
    const today = new Date().toISOString().split('T')[0];
    const fixturesResponse = await sportmonks.getFixturesByDate(today, {
      include: 'participants;scores;state;predictions.type;league.country',
      per_page: 100,
      page: 1,
    });

    const allFixtures = fixturesResponse?.data || [];
    const countryFixtures = allFixtures.filter((fixture: any) => {
      return fixture.league?.country?.id === country.id;
    });

    // Filter by specific league if provided
    const filteredFixtures = leagueId 
      ? countryFixtures.filter((fixture: any) => fixture.league?.id?.toString() === leagueId)
      : countryFixtures;

    return (
      <CountryPredictionsClient 
        country={country}
        leagues={sortedLeagues}
        fixtures={filteredFixtures}
        selectedLeagueId={leagueId ? parseInt(leagueId) : undefined}
      />
    );
  } catch (error) {
    console.error('Error loading country predictions:', error);
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
