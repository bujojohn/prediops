import { redirect, notFound } from 'next/navigation';
import { getCountryById } from '@/lib/data/countries';
import { generateCountrySlug } from '@/lib/utils/slug-utils';

interface CountryPageProps {
  params: Promise<{
    countryId: string;
  }>;
}

/**
 * Redirect from /country/[countryId] to /country/[countryId]/[slug]
 * This maintains backward compatibility for existing links while using the semantically
 * correct URL structure with slugs.
 */
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

    // Generate canonical slug and redirect
    const canonicalSlug = generateCountrySlug(country);
    redirect(`/country/${countryId}/${canonicalSlug}`);
  } catch (error) {
    console.error('Error in country redirect:', error);
    notFound();
  }
}
