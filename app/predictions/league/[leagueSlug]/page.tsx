import { notFound } from "next/navigation";
import { sportmonks } from "@/lib/sportmonks";
import { League } from "@/schemas/league.schema";
import { Fixture } from "@/schemas/fixture.schema";
import { Standing } from "@/schemas/standing.schema";
import { Team } from "@/schemas/team.schema";
import { LeaguePredictionsClient } from "./league-predictions-client";

interface LeaguePredictionsPageProps {
  params: Promise<{
    leagueSlug: string;
  }>;
  searchParams: Promise<{ id?: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ leagueSlug: string }>;
}) {
  const { leagueSlug } = await params;

  try {
    // Find league by slug
    const league = await findLeagueBySlug(leagueSlug);

    if (!league) {
      return {
        title: "League Not Found",
        description: "The requested league could not be found.",
      };
    }

    return {
      title: `${league.name} Predictions & Fixtures | Prediops`,
      description: `Get AI-powered predictions, live scores, and fixtures for ${league.name}. View matches and betting opportunities.`,
      keywords: `${
        league.name
      }, football predictions, live scores, fixtures, predictions, betting, ${
        league.country?.name || ""
      }`,
    };
  } catch {
    return {
      title: "League Predictions | Prediops",
      description:
        "Get AI-powered predictions and live scores for football leagues worldwide.",
    };
  }
}

// Find league by slug
async function findLeagueBySlug(slug: string): Promise<League | null> {
  try {
    console.log(`Searching for league with slug: ${slug}`);

    // Search through multiple pages to find the league
    let currentPage = 1;
    const maxPages = 10; // Search up to 500 leagues

    while (currentPage <= maxPages) {
      console.log(`Searching page ${currentPage} for league: ${slug}`);

      const leaguesResponse = await sportmonks.getLeagues({
        include: "country;sport;currentSeason",
        per_page: 50,
        page: currentPage,
      });

      // Add small delay to avoid rate limiting
      if (currentPage > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (leaguesResponse?.data && leaguesResponse.data.length > 0) {
        console.log(
          `Page ${currentPage}: Found ${leaguesResponse.data.length} leagues`
        );

        // Debug: Show first few league names and their slugs
        if (currentPage === 1) {
          console.log("Sample leagues from first page:");
          leaguesResponse.data.slice(0, 5).forEach((league: League) => {
            const leagueSlug = generateLeagueSlug(league);
            console.log(`  - "${league.name}" -> slug: "${leagueSlug}"`);
          });
        }

        // Check if any league matches the slug
        const league = leaguesResponse.data.find((league: League) => {
          const leagueSlug = generateLeagueSlug(league);
          const matches = leagueSlug === slug.toLowerCase();
          if (matches) {
            console.log(
              `Found matching league: ${league.name} (ID: ${league.id}) with slug: ${leagueSlug}`
            );
          }
          return matches;
        });

        if (league) {
          return league;
        }

        currentPage++;
      } else {
        // No more data, break
        break;
      }
    }

    console.log(`League not found after searching ${maxPages} pages`);
  } catch (error) {
    console.error("Error finding league by slug:", error);
  }

  return null;
}

// Generate SEO-friendly slug from league name
function generateLeagueSlug(league: League): string {
  const name = league.name || "unknown";

  // Handle special cases
  const specialCases: Record<string, string> = {
    "fa cup": "fa-cup",
    "premier league": "premier-league",
    "champions league": "champions-league",
    "europa league": "europa-league",
    "la liga": "la-liga",
    bundesliga: "bundesliga",
    "serie a": "serie-a",
    "ligue 1": "ligue-1",
  };

  const lowerName = name.toLowerCase().trim();

  // Check if it's a special case first
  if (specialCases[lowerName]) {
    return specialCases[lowerName];
  }

  // Generate slug for other cases
  return lowerName
    .replace(/[\s\-_]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function LeaguePredictionsPage({
  params,
  searchParams,
}: LeaguePredictionsPageProps ) {
  const { leagueSlug } = await params;

  try {
    console.log(`=== League Predictions Page Debug ===`);
    console.log(`League Slug: ${leagueSlug}`);

    // Prefer fetching by id if provided (more reliable than slug)
    let league: League | null = null;
    const idParam = (await searchParams)?.id;

    if (idParam) {
      try {
        const byId = await sportmonks.getLeaguesById(idParam, {
          include: "country;sport;currentSeason",
        });
        league = byId?.data?.[0] || null;
        if (league) {
          console.log(`Found league by id: ${league.name} (ID: ${league.id})`);
        }
      } catch {
        console.warn(
          `Failed to fetch league by id=${idParam}, falling back to slug`
        );
      }
    }

    if (!league) {
      league = await findLeagueBySlug(leagueSlug);
    }

    if (!league) {
      console.error(`League not found: Slug=${leagueSlug}`);
      notFound();
    }

    console.log(`Found league: ${league.name} (ID: ${league.id})`);

    // Fetch league standings (by season)
    let standings: Standing[] = [];
    let teams: Team[] = [];
    const seasonId = (league as League & { currentseason?: { id?: number } | null; currentSeason?: { id?: number } | null })?.currentseason?.id
      || (league as League & { currentseason?: { id?: number } | null; currentSeason?: { id?: number } | null })?.currentSeason?.id;
    if (seasonId) {
      try {
        const standingsResp = await sportmonks.getLeagueStandings(String(seasonId), { include: 'participant' });
        standings = (standingsResp as { data?: Standing[] })?.data ?? [];
        // Derive teams from standings participants (unique by participant.id)
        const seen = new Set<number>();
        teams = (standings || [])
          .map((s: Standing) => s?.participant)
          .filter((p): p is Team => {
            const team = p as unknown as Team | null | undefined;
            return Boolean(team && typeof team.id === 'number');
          })
          .filter((team: Team) => {
            if (seen.has(team.id!)) return false;
            seen.add(team.id!);
            return true;
          });
      } catch (err) {
        console.warn('Failed to fetch standings for season', seasonId, err);
      }
    }

    // Get fixtures for the next 7 days for this league using date range (more efficient)
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6); // 7 days total (today + 6 more)
    
    const startDateString = today.toISOString().split("T")[0];
    const endDateString = endDate.toISOString().split("T")[0];
    const dateRange = `${startDateString},${endDateString}`;
    
    console.log(`Fetching fixtures for date range: ${dateRange}`);
    
    let allFixtures: Fixture[] = [];
    
    try {
      const fixturesResponse = await sportmonks.getFixturesByDateRange(startDateString, endDateString, {
        include:
          "participants;scores;state;predictions;predictions.market;predictions.outcomes;league.country;venue;stage;round",
        per_page: 50, //TODO cosider clientside asycn fetch on demamand for more than limit 50
        page: 1,
      });

      // Extract fixtures for this specific league
      allFixtures = (fixturesResponse?.data || []).filter(
        (fixture: Fixture) =>
          fixture.league?.id?.toString() === league.id?.toString()
      );
      
      console.log(
        `Found ${allFixtures.length} fixtures for league ${league.name} in date range ${startDateString} to ${endDateString}`
      );
    } catch (error) {
      console.error('Error fetching fixtures by date range:', error);
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
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No upcoming fixtures found for {league.name}
            </p>
          </div>
        )}
      </div>
    );
  } catch {
    notFound();
  }
}
