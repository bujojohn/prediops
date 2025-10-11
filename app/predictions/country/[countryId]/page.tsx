import { redirect, notFound } from "next/navigation";
import { getCountryById } from "@/lib/data/countries";
import { generateCountrySlug } from "@/lib/utils/slug-utils";

/**
 * Legacy route handler - redirects to new slug-based URL
 * Supports: /predictions/country/[countryId]
 * Redirects to: /predictions/country/[countryId]/[slug]
 */
export default async function CountryLegacyRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ countryId: string }>;
  searchParams: Promise<{ league?: string; tab?: string }>;
}) {
  const { countryId } = await params;
  const searchParamsResolved = await searchParams;

  try {
    // Get country by Sportmonks API ID
    const country = getCountryById(parseInt(countryId));

    if (!country) {
      notFound();
    }

    // Generate slug and redirect to canonical URL
    const slug = generateCountrySlug(country);
    
    // Preserve query parameters in redirect
    const queryParams = new URLSearchParams();
    if (searchParamsResolved.league) {
      queryParams.set('league', searchParamsResolved.league);
    }
    if (searchParamsResolved.tab) {
      queryParams.set('tab', searchParamsResolved.tab);
    }

    const queryString = queryParams.toString();
    const redirectUrl = `/predictions/country/${countryId}/${slug}${queryString ? `?${queryString}` : ''}`;

    redirect(redirectUrl);
  } catch (error) {
    console.error("Error in country legacy redirect:", error);
    notFound();
  }
}

