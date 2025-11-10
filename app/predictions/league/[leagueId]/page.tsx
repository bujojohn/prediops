import { redirect, notFound } from "next/navigation";
import { sportmonks } from "@/lib/sportmonks";
import { generateLeagueSlug } from "@/lib/utils/slug-utils";

/**
 * Legacy route handler - redirects to new slug-based URL
 * Supports: /predictions/league/[leagueId]
 * Redirects to: /predictions/league/[leagueId]/[slug]
 */
export default async function LeagueLegacyRedirect({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;

  try {
    // Fetch league to get name for slug generation
    const leagueResponse = await sportmonks.getLeagueById(leagueId, {
      include: "country;sport;currentSeason",
    });

    const unwrapData = <T,>(data: T | T[] | undefined | null): T | null => {
      if (!data) return null;
      return Array.isArray(data) ? (data[0] ?? null) : data;
    };

    const league = unwrapData(leagueResponse?.data);

    if (!league) {
      notFound();
    }

    // Generate slug and redirect to canonical URL
    const slug = generateLeagueSlug(league);
    redirect(`/predictions/league/${leagueId}/${slug}`);
  } catch (error) {
    console.error("Error in league legacy redirect:", error);
    notFound();
  }
}

