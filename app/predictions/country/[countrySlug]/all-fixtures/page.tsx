import { notFound } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { getCountries, getCountryById } from '@/lib/data/countries';
import { Country } from '@/schemas/country.schema';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { findCountryBySlug } from '@/lib/utils/country-utils';
import { AllFixturesClient } from './all-fixtures-client';

interface AllFixturesPageProps {
  params: Promise<{
    countrySlug: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function AllFixturesPage({ 
  params, 
  searchParams 
}: AllFixturesPageProps) {
  const { countrySlug } = await params;
  const { id: countryId } = await searchParams;

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

    console.log(`Loading all fixtures for country: ${country.name} (ID: ${country.id})`);

    // Get all active leagues for this country
    let activeLeagues: League[] = [];
    try {
      const leaguesResponse = await sportmonks.getLeagues({
        include: 'country;sport;currentseason',
        per_page: 50,
        page: 1
      });

      const allLeagues = leaguesResponse?.data || [];
      activeLeagues = allLeagues.filter((league) => {
        const leagueData = league as { country_id?: number; country?: { id: number }; active?: boolean };
        return (leagueData.country_id?.toString() === country.id.toString() || 
                leagueData.country?.id?.toString() === country.id.toString()) &&
               leagueData.active === true;
      });

      console.log(`Found ${activeLeagues.length} active leagues for ${country.name}`);
    } catch (leaguesError) {
      console.error(`Error loading leagues for ${country.name}:`, leaguesError);
    }

    // Get all fixtures for this country (not just today)
    let allFixtures: Fixture[] = [];
    try {
      // Get fixtures for the next 7 days to show upcoming matches
      const today = new Date();
      const fixturesPromises = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
                 fixturesPromises.push(
           sportmonks.getFixturesByDate(dateString, {
             include: 'participants;scores;state;predictions.type;league.country',
             per_page: 50,
             page: 1,
           })
         );
      }

      const fixturesResponses = await Promise.all(fixturesPromises);
      
      fixturesResponses.forEach(response => {
        const fixtures = response?.data || [];
        const countryFixtures = fixtures.filter((fixture: Fixture) => {
          return fixture.league?.country?.id === country.id;
        });
        allFixtures = [...allFixtures, ...countryFixtures];
      });

      console.log(`Found ${allFixtures.length} total fixtures for ${country.name} in next 7 days`);
    } catch (fixturesError) {
      console.error(`Error loading fixtures for ${country.name}:`, fixturesError);
    }

    return (
      <AllFixturesClient 
        country={country}
        leagues={activeLeagues}
        fixtures={allFixtures}
      />
    );
  } catch (error) {
    console.error('Critical error loading all fixtures:', error);
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
    title: `${country.name} All Fixtures & Predictions | Prediops`,
    description: `View all fixtures, predictions, and live scores for ${country.name}. Browse matches by league with AI-powered predictions.`,
    keywords: `${country.name}, football fixtures, predictions, live scores, leagues, matches, ${country.fifa_name || ''}`,
  };
}
