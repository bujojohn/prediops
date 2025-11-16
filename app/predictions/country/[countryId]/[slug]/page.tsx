import { notFound, redirect } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { getCountryById } from '@/lib/data/countries';
import { League } from '@/schemas/league.schema';
import { Fixture } from '@/schemas/fixture.schema';
import { CountryPredictionsClient } from '../country-predictions-client';
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
  const { countryId } = await params;

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
  params
}: CountryPredictionsPageProps) {
  const { countryId, slug: urlSlug } = await params;

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
      // Align with sidebar: use optimized API that returns active leagues grouped by country
      const base = process.env.NEXT_PUBLIC_BASE_URL || '';
      const res = await fetch(`${base}/api/sportmonks/leagues/country-optimized/${countryId}?populate=true`, {
        // Avoid serving stale during navigation to ensure consistency with sidebar counts
        cache: 'no-store',
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`country-optimized leagues failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      countryLeagues = Array.isArray(data?.data) ? data.data : [];
      console.log(`Found ${countryLeagues.length} leagues for ${country.name} (optimized endpoint)`);
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
        include: 'participants;scores;state;predictions;predictions.type;league.country',
        per_page: 50,
        page: 1,
      });

      const allFixtures = fixturesResponse?.data || [];
      
      // Debug: Check if raw fixtures have predictions
      if (allFixtures.length > 0) {
        const sample = allFixtures[0] as Fixture;
        const predictionTypes = sample.predictions?.map((p) => ({
          typeId: p.type_id,
          typeName: p.type?.name,
          hasHomeAwayDraw: !!(p.predictions && typeof p.predictions === 'object' && 'home' in p.predictions && 'away' in p.predictions && 'draw' in p.predictions),
          hasYesNo: !!(p.predictions && typeof p.predictions === 'object' && 'yes' in p.predictions && 'no' in p.predictions),
        })) || [];
        
        console.log(`[DEBUG Country Page] Sample raw fixture:`, {
          id: sample.id,
          name: sample.name,
          hasPredictions: !!sample.predictions,
          predictionsCount: sample.predictions?.length || 0,
          predictionTypes: predictionTypes,
          samplePredictionStructure: sample.predictions?.[0]?.predictions
        });
      }
      
      // Log all fixtures before filtering
      console.log(`[DEBUG] All fixtures from API (${allFixtures.length} total):`);
      allFixtures.slice(0, 3).forEach((f: unknown, i: number) => {
        const fixture = f as Fixture;
        console.log(`  Fixture ${i}: ${fixture.name} (ID: ${fixture.id}), Country: ${fixture.league?.country?.id}, Predictions: ${fixture.predictions?.length || 0}`);
      });
      
      const filteredFixtures = allFixtures.filter((fixture: unknown) => {
        const f = fixture as Fixture;
        const matches = f.league?.country?.id === country.id;
        if (matches && process.env.NODE_ENV === 'development') {
          console.log(`  ✓ Matched: ${f.name}, Predictions: ${f.predictions?.length || 0}`);
        }
        return matches;
      });
      
      countryFixtures.push(...filteredFixtures);
      
      // Debug: Check if filtered fixtures still have predictions
      if (countryFixtures.length > 0) {
        const sampleFiltered = countryFixtures[0] as Fixture;
        const filteredPredictionTypes = sampleFiltered.predictions?.map((p) => ({
          typeId: p.type_id,
          typeName: p.type?.name,
          hasHomeAwayDraw: !!(p.predictions && typeof p.predictions === 'object' && 'home' in p.predictions && 'away' in p.predictions && 'draw' in p.predictions),
          hasYesNo: !!(p.predictions && typeof p.predictions === 'object' && 'yes' in p.predictions && 'no' in p.predictions),
          predictionsStructure: p.predictions && typeof p.predictions === 'object' ? Object.keys(p.predictions) : []
        })) || [];
        
        console.log(`[DEBUG Country Page] Sample filtered fixture:`, {
          id: sampleFiltered.id,
          name: sampleFiltered.name,
          countryId: sampleFiltered.league?.country?.id,
          hasPredictions: !!sampleFiltered.predictions,
          predictionsCount: sampleFiltered.predictions?.length || 0,
          predictionTypes: filteredPredictionTypes
        });
      }
      
      console.log(`Found ${countryFixtures.length} fixtures for ${country.name} today using getFixturesByDate`);
    } catch (fixturesError) {
      console.error(`Error loading fixtures for ${country.name}:`, fixturesError);
      // Continue with empty fixtures array instead of failing completely
    }

    return (
      <CountryPredictionsClient
        country={country}
        leagues={sortedLeagues as League[]}
        fixtures={countryFixtures as Fixture[]}
      />
    );
  } catch (error) {
    console.error(`Error in country predictions page:`, error);
    notFound();
  }
}

