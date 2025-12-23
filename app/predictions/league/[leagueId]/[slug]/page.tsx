import { redirect } from "next/navigation";
import { sportmonks } from "@/lib/sportmonks";
import { generateLeagueSlug } from "@/lib/utils/slug-utils";

interface LeaguePredictionsPageProps {
  params: Promise<{
    leagueId: string;
    slug: string;
  }>;
  searchParams: Promise<{ startDate?: string; endDate?: string; tab?: string }>;
}

/**
 * Redirect from /predictions/league/[leagueId]/[slug] to /league/[leagueId]/[slug]
 * This maintains backward compatibility for existing links while using the semantically
 * correct URL structure.
 */
export default async function LeaguePredictionsPage({
  params,
  searchParams,
}: LeaguePredictionsPageProps) {
  const { leagueId, slug } = await params;
  const resolvedSearchParams = await searchParams;

  try {
    // Fetch league to get canonical slug
    const leagueResponse = await sportmonks.getLeagueById(leagueId, {
      include: "country;sport;currentSeason",
    });

    const unwrapData = <T,>(data: T | T[] | undefined | null): T | null => {
      if (!data) return null;
      return Array.isArray(data) ? (data[0] ?? null) : data;
    };

    const league = unwrapData(leagueResponse?.data);

    if (!league) {
      // If league not found, redirect anyway (will 404 on new route)
      redirect(`/league/${leagueId}/${slug}`);
    }

    // Generate canonical slug
    const canonicalSlug = generateLeagueSlug(league);

    // Build redirect URL with search params
    const searchParamsString = new URLSearchParams();
    if (resolvedSearchParams.startDate) {
      searchParamsString.set("startDate", resolvedSearchParams.startDate);
    }
    if (resolvedSearchParams.endDate) {
      searchParamsString.set("endDate", resolvedSearchParams.endDate);
    }
    if (resolvedSearchParams.tab) {
      searchParamsString.set("tab", resolvedSearchParams.tab);
    }

    const queryString = searchParamsString.toString();
    const redirectUrl = `/league/${leagueId}/${canonicalSlug}${queryString ? `?${queryString}` : ""}`;

    redirect(redirectUrl);
  } catch (error) {
    // On error, redirect anyway (will handle error on new route)
    console.error("Error in league predictions redirect:", error);
    redirect(`/league/${leagueId}/${slug}`);
  }
}
