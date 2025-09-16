import { notFound, redirect } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { TeamDetailedSchema } from '@/schemas/team-detailed.schema';
import { TeamDetailClient } from './team-detail-client';
import { generateTeamSlug } from '@/lib/utils/team-utils';

interface TeamDetailPageProps {
  params: Promise<{
    teamSlug: string;
  }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamSlug } = await params;
  
  try {
    // For now, we'll extract the team ID from the slug
    // In production, you might want to store slug-to-ID mappings
    const teamIdMatch = teamSlug.match(/^team-(\d+)$/);
    if (!teamIdMatch) {
      notFound();
    }
    
    const teamId = teamIdMatch[1];
    
    // Fetch detailed team data with all includes
    const teamResponse = await sportmonks.getTeamWithDetails(teamId, {
      include: "country;coaches;rivals;players;latest;upcoming;seasons;activeSeasons;sidelined;sidelinedHistory;trophies;socials"
    });
    
    if (!teamResponse.data) {
      notFound();
    }
    
    // Validate the response data
    const team = TeamDetailedSchema.parse(teamResponse.data);
    
    // Verify the slug matches (for SEO)
    const expectedSlug = generateTeamSlug(team);
    if (expectedSlug !== teamSlug) {
      // Redirect to correct slug
      redirect(`/teams/${expectedSlug}`);
    }
    
    return (
      <div className="container mx-auto px-4 py-6">
        <TeamDetailClient team={team} />
      </div>
    );
  } catch {
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TeamDetailPageProps) {
  const { teamSlug } = await params;
  
  try {
    const teamIdMatch = teamSlug.match(/^team-(\d+)$/);
    if (!teamIdMatch) {
      return {
        title: 'Team Not Found',
        description: 'The requested team could not be found.',
      };
    }
    
    const teamId = teamIdMatch[1];
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
