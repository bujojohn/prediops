import { notFound } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { CountryPageClient } from './country-page-client';
import { Fixture } from '@/schemas/fixture.schema'; 
import { getCountryById } from '@/lib/data/countries';

interface CountryPageProps {
  params: Promise<{
    countryId: string;
  }>;
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { countryId: countryIdParam } = await params;
  const countryId = parseInt(countryIdParam);
  
  if (isNaN(countryId)) {
    notFound();
  }

  try {
    // Get country from local data
    const country = getCountryById(countryId);
    
    if (!country) {
      notFound();
    }

    // Load today's fixtures for this country
    const fixturesResponse = await sportmonks.getFixturesByDate(new Date().toISOString().split('T')[0], {
      include: 'participants;scores;state;league.country',
      per_page: 100,
      page: 1,
    });

    const fixtures: Fixture[] = fixturesResponse?.data || [];

    // Filter fixtures for this country
    const countryFixtures = fixtures.filter((fixture) => {
      const f = fixture as {
        league?: {
          country?: {
            id?: number;
          };
        };
      };
      return f.league?.country?.id === countryId;
    });

    return (
      <CountryPageClient 
        country={country} 
        initialFixtures={countryFixtures}
        countryId={countryId}
      />
    );
  } catch (error) {
    console.error('Error loading country data:', error);
    notFound();
  }
}
