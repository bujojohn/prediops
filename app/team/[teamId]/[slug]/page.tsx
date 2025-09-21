import { notFound, redirect } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { TeamDetailedSchema } from '@/schemas/team-detailed.schema';
import { FixtureSchema } from '@/schemas/fixture.schema';
import { TeamDetailClient } from './team-detail-client';
import { generateTeamSlug } from '@/lib/utils/team-utils';

interface TeamDetailPageProps {
  params: Promise<{
    teamId: string;
    slug: string;
  }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId, slug: urlSlug } = await params;
  
  try {
    // Fetch detailed team data with all includes
    const teamResponse = await sportmonks.getTeamWithDetails(teamId, {
      include: "country;coaches;rivals;players;latest;upcoming;seasons;activeSeasons;sidelined;sidelinedHistory;trophies;socials;rankings"
    });
    
    if (!teamResponse.data) {
      notFound();
    }
    
    // Validate the response data
    const team = TeamDetailedSchema.parse(teamResponse.data);
    
    // Generate expected slug for SEO redirect
    const expectedSlug = generateTeamSlug(team);
    
    // If URL doesn't include slug or slug is incorrect, redirect to correct URL
    if (!urlSlug || expectedSlug !== urlSlug) {
      redirect(`/team/${teamId}/${expectedSlug}`);
    }

    // Fetch upcoming fixtures for the team (next 14 days)
    let upcomingFixtures = [];
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 14); // Next 14 days
      
      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const fixturesResponse = await sportmonks.getFixuresByDateRangeForTeam(
        teamId,
        startDateStr,
        endDateStr,
        {
          include: "participants;scores;state;predictions.type;league.country;stage;round",
          per_page: 50,
          page: 1,
        }
      );
      
      // Validate fixtures data
      if (fixturesResponse?.data) {
        upcomingFixtures = fixturesResponse.data.map((fixture: unknown) => {
          try {
            return FixtureSchema.parse(fixture);
          } catch (error) {
            console.warn('Invalid fixture data:', error);
            return null;
          }
        }).filter((fixture: any): fixture is NonNullable<typeof fixture> => fixture !== null);
      }
    } catch (error) {
      console.warn('Error fetching team fixtures:', error);
      // Continue without fixtures data
    }
    
    return (
      <div className="container mx-auto px-4 py-6">
        <TeamDetailClient team={team} initialFixtures={upcomingFixtures} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching team details:", error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TeamDetailPageProps) {
  const { teamId, slug: urlSlug } = await params;
  
  try {
    const teamResponse = await sportmonks.getTeamWithDetails(teamId, {
      include: "country"
    });
    
    if (!teamResponse.data) {
      return {
        title: 'Team Not Found',
        description: 'The requested team could not be found.',
      };
    }
    
    const team = teamResponse.data;
    const expectedSlug = generateTeamSlug(team);

    if (!urlSlug || expectedSlug !== urlSlug) {
      // If slug is incorrect, metadata should reflect the correct team name
      return {
        title: `${team.name} - Team Details (Redirecting)`,
        description: `Redirecting to the correct page for ${team.name}.`,
      };
    }
    
    return {
      title: `${team.name} - Team Details`,
      description: `View detailed information about ${team.name}, including squad, fixtures, and statistics.`,
      openGraph: {
        title: `${team.name} - Team Details`,
        description: `View detailed information about ${team.name}, including squad, fixtures, and statistics.`,
        images: team.image_path ? [{ url: team.image_path }] : [],
      },
    };
  } catch {
    return {
      title: 'Team Details',
      description: 'View detailed team information.',
    };
  }
}
