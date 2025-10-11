import { notFound, redirect } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { getCountryById } from '@/lib/data/countries';
import { Country } from '@/schemas/country.schema';
import { CountryPredictionsClient } from '../../[countrySlug]/country-predictions-client';
import { generateCountrySlug } from '@/lib/utils/slug-utils';
import type { Metadata } from 'next';

interface CountryPredictionsPageProps {
  params: Promise<{
    countryId: string;
    slug: string;
  }>;
  searchParams: Promise<{
    league?: string;
    tab?: string;
  }>;
}

// Generate metadata for SEO with canonical URL
export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryId: string; slug: string }>;
}): Promise<Metadata> {
  const { countryId, slug } = await params;

  try {
    const country = getCountryById(parseInt(countryId));

    if (!country) {
      return {
        title: "Country Not Found",
        description: "The requested country could not be found.",
      };
    }

    const canonicalSlug = generateCountrySlug(country);
    const canonicalUrl = `https://prediops.com/predictions/country/${countryId}/${canonicalSlug}`;

    return {
      title: `${country.name} Football Predictions & Fixtures | Prediops`,
      description: `Get AI-powered predictions, live scores, and fixtures for ${country.name} football leagues. View matches and betting opportunities.`,
      keywords: `${country.name}, football predictions, live scores, fixtures, predictions, betting`,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${country.name} Football Predictions & Fixtures`,
        description: `Get AI-powered predictions, live scores, and fixtures for ${country.name} football leagues.`,
        url: canonicalUrl,
        siteName: "Prediops",
        type: "website",
      },
    };
  } catch {
    return {
      title: "Country Predictions | Prediops",
      description:
        "Get AI-powered predictions and live scores for football leagues worldwide.",
    };
  }
}

export default async function CountryPredictionsPage({ 
  params, 
  searchParams 
}: CountryPredictionsPageProps) {
  const { countryId, slug: urlSlug } = await params;
  const { league: leagueId } = await searchParams;

  try {
    // Get country by Sportmonks API ID
    const country = getCountryById(parseInt(countryId));

    if (!country) {
      console.error(`Country not found: ID=${countryId}`);
      notFound();
    }

    console.log(`Loading data for country: ${country.name} (ID: ${country.id})`);

    // Generate canonical slug and redirect if mismatch
    const canonicalSlug = generateCountrySlug(country);

    if (urlSlug !== canonicalSlug) {
      console.log(`Redirecting to canonical slug: ${canonicalSlug}`);
      redirect(`/predictions/country/${countryId}/${canonicalSlug}`);
    }

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
    const countryFixtures: unknown[] = [];
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log(`Attempting to fetch fixtures for ${country.name} on ${today}`);
      
      // Since getLeaguesByFixtureDate doesn't return fixtures, use getFixturesByDate directly
      const fixturesResponse = await sportmonks.getFixturesByDate(today, {
        include: 'participants;scores;state;predictions.type;league.country',
        per_page: 50,
        page: 1,
      });

      const allFixtures = fixturesResponse?.data || [];
      const filteredFixtures = allFixtures.filter((fixture: unknown) => {
        return (fixture as { league?: { country?: { id: number } } }).league?.country?.id === country.id;
      });
      
      countryFixtures.push(...filteredFixtures);
      console.log(`Found ${countryFixtures.length} fixtures for ${country.name} today using getFixturesByDate`);
    } catch (fixturesError) {
      console.error(`Error loading fixtures for ${country.name}:`, fixturesError);
      // Continue with empty fixtures array instead of failing completely
    }

    return (
      <CountryPredictionsClient
        country={country}
        leagues={sortedLeagues as Country[]}
        fixtures={countryFixtures as unknown[]}
        selectedLeagueId={leagueId}
      />
    );
  } catch (error) {
    console.error(`Error in country predictions page:`, error);
    notFound();
  }
}

