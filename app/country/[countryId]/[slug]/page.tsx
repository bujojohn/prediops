import { notFound, redirect } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { CountryPageClient } from '../country-page-client';
import { Fixture } from '@/schemas/fixture.schema'; 
import { getCountryById } from '@/lib/data/countries';
import { generateCountrySlug } from '@/lib/utils/slug-utils';
import type { Metadata } from 'next';

interface CountryPageProps {
  params: Promise<{
    countryId: string;
    slug: string;
  }>;
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

export default async function CountryPage({ params }: CountryPageProps) {
  const { countryId: countryIdParam, slug: urlSlug } = await params;
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

    // Load today's fixtures for this country
    const fixturesResponse = await sportmonks.getFixturesByDate(new Date().toISOString().split('T')[0], {
      include: 'participants;scores;state;league;league.country',
      per_page: 50,
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

