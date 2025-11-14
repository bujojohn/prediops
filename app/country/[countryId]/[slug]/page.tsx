import { notFound, redirect } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { CountryPageClient } from '../country-page-client';
import { Fixture } from '@/schemas/fixture.schema';
import { League } from '@/schemas/league.schema';
import { getCountryById } from '@/lib/data/countries';
import { generateCountrySlug } from '@/lib/utils/slug-utils';
import type { Metadata } from 'next';

interface CountryPageProps {
  params: Promise<{
    countryId: string;
    slug: string;
  }>;
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}

// Generate metadata for SEO with canonical URL
export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryId: string; slug: string }>;
}): Promise<Metadata> {
  const { countryId } = await params;
  const countryIdNum = parseInt(countryId);

  if (isNaN(countryIdNum)) {
    return {
      title: "Country Not Found",
      description: "The requested country could not be found.",
    };
  }

  try {
    const country = getCountryById(countryIdNum);

    if (!country) {
      return {
        title: "Country Not Found",
        description: "The requested country could not be found.",
      };
    }

    const canonicalSlug = generateCountrySlug(country);
    const canonicalUrl = `https://prediops.com/country/${countryId}/${canonicalSlug}`;

    return {
      title: `${country.name} - Fixtures & Leagues | Prediops`,
      description: `View fixtures, leagues, and teams for ${country.name}. Get AI-powered predictions and live scores.`,
      keywords: `${country.name}, football, fixtures, leagues, teams, predictions, live scores`,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${country.name} - Fixtures & Leagues`,
        description: `View fixtures, leagues, and teams for ${country.name}.`,
        url: canonicalUrl,
        siteName: "Prediops",
        type: "website",
      },
    };
  } catch {
    return {
      title: "Country | Prediops",
      description: "View country fixtures, leagues, and teams.",
    };
  }
}

export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const { countryId: countryIdParam, slug: urlSlug } = await params;
  const resolvedSearchParams = await searchParams;
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

    // Generate canonical slug and redirect if mismatch
    const canonicalSlug = generateCountrySlug(country);
    const normalizeForComparison = (s: string) => s.toLowerCase().replace(/-+/g, '-').trim();
    
    if (normalizeForComparison(urlSlug) !== normalizeForComparison(canonicalSlug)) {
      console.log(`Redirecting from "${urlSlug}" to canonical slug: "${canonicalSlug}"`);
      redirect(`/country/${countryId}/${canonicalSlug}`);
    }

    // Get date range from URL params or default to next 7 days
    let startDate: Date;
    let endDate: Date;
    let startDateString: string;
    let endDateString: string;

    if (resolvedSearchParams.startDate && resolvedSearchParams.endDate) {
      startDate = new Date(resolvedSearchParams.startDate);
      endDate = new Date(resolvedSearchParams.endDate);
      startDateString = resolvedSearchParams.startDate;
      endDateString = resolvedSearchParams.endDate;
    } else {
      // Default to next 7 days
      const today = new Date();
      startDate = today;
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 6); // 7 days total (today + 6 more)
      startDateString = today.toISOString().split('T')[0];
      endDateString = endDate.toISOString().split('T')[0];
    }

    // Fetch leagues for this country
    let countryLeagues: League[] = [];
    try {
      const leaguesResponse = await sportmonks.getLeaguesByCountryId(countryId.toString(), {
        include: 'country;sport;currentseason',
        per_page: 50,
        page: 1,
      });
      countryLeagues = (leaguesResponse?.data || []).filter((league: League) => league.active === true);
      // Sort leagues by name
      countryLeagues.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
    } catch (leaguesError) {
      console.error(`Error loading leagues for ${country.name}:`, leaguesError);
    }

    // Fetch fixtures for date range
    let allFixtures: Fixture[] = [];
    try {
      const fixturesResponse = await sportmonks.getFixturesByDateRange(
        startDateString,
        endDateString,
        {
          include: 'participants;scores;state;predictions;predictions.type;league.country;stage;round',
          per_page: 100,
          page: 1,
        }
      );

      const rawFixtures = fixturesResponse?.data || [];

      // Filter fixtures for this country
      allFixtures = rawFixtures.filter((fixture: Fixture) => {
        const f = fixture as {
          league?: {
            country?: {
              id?: number;
            };
          };
        };
        return f.league?.country?.id === countryId;
      });
    } catch (error) {
      console.error('Error fetching fixtures by date range:', error);
    }

    return (
      <div className="container mx-auto px-6 py-8">
        <CountryPageClient 
          country={country} 
          initialFixtures={allFixtures}
          leagues={countryLeagues}
          initialStartDate={startDate}
          initialEndDate={endDate}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading country data:', error);
    notFound();
  }
}

