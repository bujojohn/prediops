import { redirect } from 'next/navigation';
import { sportmonks } from '@/lib/sportmonks';
import { generateTeamSlug } from '@/lib/utils/slug-utils';

interface TeamDetailPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId } = await params;
  
  try {
    // Fetch basic team data to generate slug
    const teamResponse = await sportmonks.getTeamWithDetails(teamId, {
      include: "country"
    });
    
    if (!teamResponse.data) {
      redirect('/teams'); // Redirect to teams list if team not found
    }
    
    const team = teamResponse.data;
    const slug = generateTeamSlug(team);
    
    // Redirect to the slug version
    redirect(`/team/${teamId}/${slug}`);
  } catch {
    redirect('/teams'); // Redirect to teams list on error
  }
}