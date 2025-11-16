import { Suspense } from 'react';
import { sportmonks } from '@/lib/sportmonks';
import { LeagueSchema, League } from '@/schemas/league.schema';
import { LeaguesClient } from './leagues-client';

interface LeaguesPageProps {
  searchParams: Promise<{
    search?: string;
    country?: string;
    active?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  }>;
}

export default async function LeaguesPage({ searchParams }: LeaguesPageProps) {
  const params = await searchParams;
  
  // Build API config from search params
  const config = {
    include: 'country;sport',
    filters: {
      ...(params.active !== undefined && { populate: params.active === 'true' ? 'active' : undefined }),
    },
    order: params.sortOrder || 'asc',
    per_page: 24,
    page: params.page ? parseInt(params.page) : 1,
  };

  try {
    // Fetch leagues data
    const leaguesResponse = await sportmonks.getLeagues(config);
    
    // Validate and filter the response data
    let leagues = leaguesResponse.data?.map((league: League) => {
      try {
        return LeagueSchema.parse(league);
      } catch (error) {
        console.error('Schema validation failed for league:', league.id, league.name);
        console.error('Validation error:', error);
        return null;
      }
    }).filter((league): league is NonNullable<typeof league> => league !== null) || [];

    // Filter by country if specified
    if (params.country) {
      leagues = leagues.filter(league => 
        league.country_id?.toString() === params.country || 
        league.country?.id?.toString() === params.country
      );
    }

    // Filter active leagues if specified
    if (params.active === 'true') {
      leagues = leagues.filter(league => league.active === true);
    } else if (params.active === 'false') {
      leagues = leagues.filter(league => league.active === false);
    }

    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Football Leagues
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore leagues and competitions from around the world
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
            <LeaguesClient 
              initialLeagues={leagues}
              initialPagination={{
                current_page: Number(leaguesResponse.pagination?.current_page) || 1,
                last_page: leaguesResponse.pagination?.has_more ? 
                  Number(leaguesResponse.pagination?.current_page) + 1 : 
                  Number(leaguesResponse.pagination?.current_page) || 1,
                per_page: Number(leaguesResponse.pagination?.per_page) || 24,
                total: Number(leaguesResponse.pagination?.count) || leagues.length,
              }}
              initialSearchParams={params}
            />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching leagues:', error);
    
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Football Leagues
          </h1>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-600 dark:text-red-400">
              Unable to load leagues at this time. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

