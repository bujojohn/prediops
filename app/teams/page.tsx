import { Suspense } from 'react';
import { sportmonks } from '@/lib/sportmonks';
import { TeamSchema, Team } from '@/schemas/team.schema';
import { TeamsClient } from './teams-client';

interface TeamsPageProps {
  searchParams: Promise<{
    search?: string;
    country?: string;
    league?: string;
    founded?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  }>;
}

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const params = await searchParams;
  
  // Build API config from search params
  const config = {
    include: 'country',
    select: 'name,short_code,image_path,founded,type',
    filters: {
      ...(params.country && { countries: params.country }),
      ...(params.league && { leagues: params.league }),
      ...(params.founded && { founded: params.founded }),
    },
    order: params.sortOrder || 'asc',
    per_page: 24,
    page: params.page ? parseInt(params.page) : 1,
  };

  try {
    // Fetch teams data
    const teamsResponse = await sportmonks.getTeams(config);
    
    // Validate the response data
    const teams = teamsResponse.data?.map((team: Team) => {
      try {
        return TeamSchema.parse(team);
      } catch (error) {
        console.error('Schema validation failed for team:', team.id, team.name);
        console.error('Validation error:', error);
        console.error('Team data:', team);
        return null;
      }
    }).filter((team): team is NonNullable<typeof team> => team !== null) || [];

    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Football Teams
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore teams from around the world
            </p>
          </div>

          {/* Client-side interactive components */}
          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          }>
            <TeamsClient 
              initialTeams={teams}
              initialPagination={{
                current_page: Number(teamsResponse.pagination?.current_page) || 1,
                last_page: teamsResponse.pagination?.has_more ? 
                  Number(teamsResponse.pagination?.current_page) + 1 : 
                  Number(teamsResponse.pagination?.current_page) || 1,
                per_page: Number(teamsResponse.pagination?.per_page) || 24,
                total: Number(teamsResponse.pagination?.count) || teams.length,
              }}
              initialSearchParams={params}
            />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching teams:', error);
    
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Football Teams
          </h1>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-600 dark:text-red-400">
              Unable to load teams at this time. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
