import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import { sportmonks } from "@/lib/sportmonks";
import { League } from "@/schemas/league.schema";
import { Fixture } from "@/schemas/fixture.schema";
import { Standing } from "@/schemas/standing.schema";
import { Team } from "@/schemas/team.schema";
import { LeaguePredictionsClient } from "../league-predictions-client";
import { generateLeagueSlug } from "@/lib/utils/slug-utils";
import type { Metadata } from "next";

interface LeaguePredictionsPageProps {
  params: Promise<{
    leagueId: string;
    slug: string;
  }>;
  searchParams: Promise<{ startDate?: string; endDate?: string; tab?: string }>;
}

// Generate metadata for SEO with canonical URL
export async function generateMetadata({
  params,
}: {
  params: Promise<{ leagueId: string; slug: string }>;
}): Promise<Metadata> {
  const { leagueId } = await params;

  try {
    const league = await sportmonks.getLeagueById(leagueId, {
      include: "country;sport;currentSeason",
    });

    const unwrapData = <T,>(data: T | T[] | undefined | null): T | null => {
      if (!data) return null;
      return Array.isArray(data) ? (data[0] ?? null) : data;
    };

    const leagueData = unwrapData(league?.data);

    if (!leagueData) {
      return {
        title: "League Not Found",
        description: "The requested league could not be found.",
      };
    }

    const canonicalSlug = generateLeagueSlug(leagueData);
    const canonicalUrl = `https://prediops.com/predictions/league/${leagueId}/${canonicalSlug}`;

    return {
      title: `${leagueData.name} Predictions & Fixtures | Prediops`,
      description: `Get AI-powered predictions, live scores, and fixtures for ${leagueData.name}. View matches and betting opportunities.`,
      keywords: `${
        leagueData.name
      }, football predictions, live scores, fixtures, predictions, betting, ${
        leagueData.country?.name || ""
      }`,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${leagueData.name} Predictions & Fixtures`,
        description: `Get AI-powered predictions, live scores, and fixtures for ${leagueData.name}.`,
        url: canonicalUrl,
        siteName: "Prediops",
        type: "website",
      },
    };
  } catch {
    return {
      title: "League Predictions | Prediops",
      description:
        "Get AI-powered predictions and live scores for football leagues worldwide.",
    };
  }
}

export default async function LeaguePredictionsPage({
  params,
  searchParams,
}: LeaguePredictionsPageProps) {
  const { leagueId, slug: urlSlug } = await params;

  try {
    console.log(`=== League Predictions Page Debug ===`);
    console.log(`League ID: ${leagueId}, URL Slug: ${urlSlug}`);

    // Fetch league using Sportmonks API ID
    const leagueResponse = await sportmonks.getLeagueById(leagueId, {
      include: "country;sport;currentSeason",
    });

    // Handle both array and object shapes returned by the API client typings
    const unwrapData = <T,>(data: T | T[] | undefined | null): T | null => {
      if (!data) return null;
      return Array.isArray(data) ? (data[0] ?? null) : data;
    };

    const league = unwrapData(leagueResponse?.data);

    if (!league) {
      console.error(`League not found: ID=${leagueId}`);
      notFound();
    }

    console.log(`Found league: ${league.name} (ID: ${league.id})`);

    // Generate canonical slug and redirect if mismatch
    const canonicalSlug = generateLeagueSlug(league);

    // Only redirect if slugs are significantly different (not just case or minor differences)
    // This prevents redirect loops and allows some flexibility
    const normalizeForComparison = (s: string) => s.toLowerCase().replace(/-+/g, '-').trim();
    
    if (normalizeForComparison(urlSlug) !== normalizeForComparison(canonicalSlug)) {
      console.log(`Redirecting from "${urlSlug}" to canonical slug: "${canonicalSlug}"`);
      redirect(`/predictions/league/${leagueId}/${canonicalSlug}`);
    }

    // Fetch league standings (by season)
    let standings: Standing[] = [];
    let teams: Team[] = [];
    const seasonId =
      (
        league as League & {
          currentseason?: { id?: number } | null;
          currentSeason?: { id?: number } | null;
        }
      )?.currentseason?.id ||
      (
        league as League & {
          currentseason?: { id?: number } | null;
          currentSeason?: { id?: number } | null;
        }
      )?.currentSeason?.id;

    if (seasonId) {
      try {
        console.log(
          `Attempting to fetch standings for league: ${league.name} seasonId: ${seasonId} leagueId: ${league.id}`
        );
        const standingsResp = await sportmonks.getLeagueStandings(
          String(seasonId),
          {
            include:
              "league;round;group;stage;form;details.type;rule.type:name;participant",
            filters: { standingLeagues: league.id },
          }
        );
        standings = (standingsResp as { data?: Standing[] })?.data ?? [];
        console.log(
          `Successfully fetched ${standings.length} standings using league.id: ${league.id}`
        );

        // Derive teams from standings participants (unique by participant.id)
        const seen = new Set<number>();
        teams = (standings || [])
          .map((s: Standing) => s?.participant)
          .filter((p): p is Team => {
            const team = p as unknown as Team | null | undefined;
            return Boolean(team && typeof team.id === "number");
          })
          .filter((team: Team) => {
            if (seen.has(team.id!)) return false;
            seen.add(team.id!);
            return true;
          });
        console.log(`Derived ${teams.length} unique teams from standings`);
      } catch (err) {
        console.warn("Failed to fetch standings for season", seasonId, err);
      }
    }

    // Get date range from URL params or default to next 7 days
    const searchParamsResolved = await searchParams;
    const startDateParam = searchParamsResolved.startDate;
    const endDateParam = searchParamsResolved.endDate;

    let startDateString: string;
    let endDateString: string;
    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
      // Use date range from URL params
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      startDateString = startDateParam;
      endDateString = endDateParam;
    } else {
      // Default to next 7 days
      const today = new Date();
      endDate = new Date(today);
      endDate.setDate(today.getDate() + 6); // 7 days total (today + 6 more)
      startDate = today;

      startDateString = today.toISOString().split("T")[0];
      endDateString = endDate.toISOString().split("T")[0];
    }

    const dateRange = `${startDateString},${endDateString}`;

    console.log(
      `Fetching fixtures for league ${league.name} (ID: ${league.id}) in date range: ${dateRange}`
    );

    let allFixtures: Fixture[] = [];

    try {
      // Try multiple approaches to get fixtures for this league
      console.log(
        `Attempting to fetch fixtures for league ${league.name} (ID: ${league.id})`
      );

      // Approach 1: Try with API filtering first
      const apiConfigWithFilter = {
        include:
          "participants;scores;state;predictions;predictions.type;league.country;stage;round",
        filters: { fixtureLeagues: league.id },
      };

      console.log("API Config with filter:", apiConfigWithFilter);

      let fixturesResponse;
      try {
        fixturesResponse = await sportmonks.getFixturesByDateRange(
          startDateString,
          endDateString,
          apiConfigWithFilter
        );
      } catch (filterError) {
        console.warn("API filtering failed, trying without filter:", filterError);
        // Approach 2: Try without API filtering
        const apiConfigNoFilter = {
          include:
            "participants;scores;state;predictions;predictions.type;league.country;stage;round",
          per_page: 50,
          page: 1,
        };
        fixturesResponse = await sportmonks.getFixturesByDateRange(
          startDateString,
          endDateString,
          apiConfigNoFilter
        );
      }

      const rawFixtures = fixturesResponse?.data || [];

      // Debug: Check if raw fixtures have predictions
      if (rawFixtures.length > 0) {
        const sampleFixture = rawFixtures[0] as Fixture;
        console.log(`[DEBUG] Sample raw fixture predictions:`, {
          fixtureId: sampleFixture.id,
          hasPredictions: !!sampleFixture.predictions,
          predictionsCount: sampleFixture.predictions?.length || 0,
          firstPrediction: sampleFixture.predictions?.[0]
        });
      }

      // Always filter client-side to ensure we only get fixtures for this league
      allFixtures = rawFixtures.filter((fixture: Fixture) => {
        const fixtureLeagueId = fixture.league?.id?.toString();
        const targetLeagueId = league.id?.toString();
        return fixtureLeagueId === targetLeagueId;
      });

      // Debug: Check if filtered fixtures still have predictions
      if (allFixtures.length > 0) {
        const sampleFiltered = allFixtures[0] as Fixture;
        console.log(`[DEBUG] Sample filtered fixture predictions:`, {
          fixtureId: sampleFiltered.id,
          hasPredictions: !!sampleFiltered.predictions,
          predictionsCount: sampleFiltered.predictions?.length || 0,
          firstPrediction: sampleFiltered.predictions?.[0]
        });
      }

      console.log(
        `Raw fixtures from API: ${rawFixtures.length}, Filtered for league ${league.name} (ID: ${league.id}): ${allFixtures.length}`
      );

      // Debug: Log first few fixtures to check league IDs
      if (rawFixtures.length > 0) {
        console.log(
          "Sample fixture league IDs:",
          rawFixtures.slice(0, 5).map((f: Fixture) => ({
            fixtureId: f.id,
            leagueId: f.league?.id,
            leagueName: f.league?.name,
          }))
        );
      }

      // If still no fixtures, try a different date range (maybe current date)
      if (allFixtures.length === 0) {
        console.log("No fixtures found in date range, trying current date...");
        const todayString = new Date().toISOString().split("T")[0];
        try {
          const todayResponse = await sportmonks.getFixturesByDate(todayString, {
            include:
              "participants;scores;state;predictions;predictions.type;league.country;stage;round",
            per_page: 50,
            page: 1,
          });

          const todayFixtures = todayResponse?.data || [];
          const todayFiltered = todayFixtures.filter((fixture: Fixture) => {
            const fixtureLeagueId = fixture.league?.id?.toString();
            const targetLeagueId = league.id?.toString();
            return fixtureLeagueId === targetLeagueId;
          });

          console.log(
            `Today's fixtures for league ${league.name}: ${todayFiltered.length}`
          );
          allFixtures = todayFiltered;
        } catch (todayError) {
          console.error("Error fetching today's fixtures:", todayError);
        }
      }
    } catch (error) {
      console.error("Error fetching fixtures by date range:", error);
      // allFixtures remains empty array from declaration above
    }

    return (
      <div className="container mx-auto px-6 py-8">
        {allFixtures.length > 0 ? (
          <LeaguePredictionsClient
            league={league}
            fixtures={allFixtures}
            predictions={[]}
            standings={standings}
            teams={teams}
            initialStartDate={startDate}
            initialEndDate={endDate}
          />
        ) : (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <div className="space-y-6">
              {/* Icon and Main Message */}
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  No Fixtures Found
                </h3>
                <p className="text-muted-foreground">
                  No upcoming fixtures found for <strong>{league.name}</strong>{" "}
                  in the selected date range.
                </p>
              </div>

              {/* Suggested Actions */}
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-2">Here are some things you can try:</p>
                  <ul className="space-y-1 text-left max-w-md mx-auto">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Try selecting a different date range</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Check if the season is currently active</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Browse other leagues or competitions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      <span>Look for upcoming matches in the next few weeks</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={`/predictions/league/${leagueId}/${canonicalSlug}?startDate=${format(
                      new Date(),
                      "yyyy-MM-dd"
                    )}&endDate=${format(
                      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                      "yyyy-MM-dd"
                    )}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Calendar className="w-4 h-4" />
                    Try Next 7 Days
                  </Link>
                  <Link
                    href={`/predictions/league/${leagueId}/${canonicalSlug}?startDate=${format(
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                      "yyyy-MM-dd"
                    )}&endDate=${format(new Date(), "yyyy-MM-dd")}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Try Last 7 Days
                  </Link>
                  <Link
                    href="/predictions"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    Browse All Fixtures
                  </Link>
                </div>
              </div>

              {/* Date Range Info */}
              <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p>
                  <strong>Selected Range:</strong>{" "}
                  {format(startDate, "MMM dd, yyyy")} -{" "}
                  {format(endDate, "MMM dd, yyyy")}
                </p>
                <p className="mt-1">
                  <strong>Tip:</strong> Try expanding your date range or selecting a
                  different time period.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in league predictions page:", error);
    notFound();
  }
}

