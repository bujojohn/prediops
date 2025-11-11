import type { Standing } from '@/schemas/standing.schema';

export type ResolvedStandingGroup = {
  name?: string | null;
  standings: Standing[];
};

interface FixtureStandingsProps {
  groups: ResolvedStandingGroup[];
  participantIds?: number[];
}

export function FixtureStandings({ groups, participantIds = [] }: FixtureStandingsProps) {
  const totalEntries = groups.reduce((sum, group) => sum + group.standings.length, 0);

  if (totalEntries === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow-sm dark:bg-gray-800">
        <h3 className="text-lg font-semibold">Standings</h3>
        <p className="mt-4 text-sm text-muted-foreground">
          Standings data is not available for this competition.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-foreground">Standings</h3>
      <p className="text-sm text-muted-foreground">
        Current table positions heading into this fixture.
      </p>

      {groups.map((group, index) => {
        if (group.standings.length === 0) {
          return null;
        }

        return (
          <div key={group.name ?? `group-${index}`} className="mt-6 overflow-x-auto">
            {group.name ? (
              <h4 className="mb-3 text-sm font-semibold text-foreground/90">{group.name}</h4>
            ) : null}

            <table className="min-w-full divide-y divide-border/60 text-sm">
              <thead className="bg-muted/60 dark:bg-muted/20">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    #
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Team
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    P
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    W
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    D
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    L
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    GF
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    GA
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    GD
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Pts
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Form
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70 dark:divide-border/40">
                {group.standings.map((standing) => (
                  <StandingRow
                    key={`${standing.participant_id ?? standing.id ?? Math.random()}`}
                    standing={standing}
                    participantIds={participantIds}
                  />
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

function resolveTeamName(standing: Standing): string {
  if (standing.participant?.name) {
    return standing.participant.name;
  }

  const nameDetail = standing.details?.find((detail) => {
    const normalized =
      normalizeDetailKey(detail.standing_type) ??
      normalizeDetailKey(detail.type?.code) ??
      normalizeDetailKey(detail.type?.name);
    return normalized === 'name';
  });

  if (nameDetail?.value != null) {
    return String(nameDetail.value);
  }

  if (typeof standing.participant_id === 'number') {
    return `Team #${standing.participant_id}`;
  }

  return 'Team';
}

const DETAIL_KEY_MAPPINGS: Record<
  'played' | 'wins' | 'draws' | 'losses' | 'goalsFor' | 'goalsAgainst' | 'goalDifference' | 'points',
  string[]
> = {
  played: ['overall_played', 'played', 'overall_gp', 'total_played', 'matches_played'],
  wins: ['overall_won', 'won', 'overall_wins', 'wins'],
  draws: ['overall_draw', 'draw', 'overall_draws', 'drawn'],
  losses: ['overall_lost', 'lost', 'overall_losses', 'losses'],
  goalsFor: ['overall_scored', 'scored', 'gf', 'goals_scored'],
  goalsAgainst: ['overall_against', 'against', 'ga', 'goals_against'],
  goalDifference: ['overall_goal_difference', 'goal_difference', 'gd'],
  points: ['overall_points', 'points'],
};

function normalizeDetailKey(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.toLowerCase().replace(/\s+/g, '_');
}

function buildDetailMap(details: Standing['details']): Map<string, number> {
  const map = new Map<string, number>();
  if (!details) return map;

  details.forEach((detail) => {
    const key =
      normalizeDetailKey(detail.standing_type) ??
      normalizeDetailKey(detail.type?.code) ??
      normalizeDetailKey(detail.type?.name);
    if (!key) return;
    if (typeof detail.value === 'number') {
      map.set(key, detail.value);
    }
  });

  return map;
}

function resolveStat(
  standing: Standing,
  field: keyof Standing,
  detailKeys: string[],
  detailMap: Map<string, number>,
): number | null {
  const direct = standing[field];
  if (typeof direct === 'number') {
    return direct;
  }

  for (const key of detailKeys) {
    const normalized = normalizeDetailKey(key);
    if (normalized && detailMap.has(normalized)) {
      return detailMap.get(normalized) ?? null;
    }
  }

  return null;
}

function StandingRow({
  standing,
  participantIds,
}: {
  standing: Standing;
  participantIds: number[];
}) {
  const detailMap = buildDetailMap(standing.details);
  const stats = {
    played: resolveStat(standing, 'games_played', DETAIL_KEY_MAPPINGS.played, detailMap),
    wins: resolveStat(standing, 'wins', DETAIL_KEY_MAPPINGS.wins, detailMap),
    draws: resolveStat(standing, 'draws', DETAIL_KEY_MAPPINGS.draws, detailMap),
    losses: resolveStat(standing, 'losses', DETAIL_KEY_MAPPINGS.losses, detailMap),
    goalsFor: resolveStat(standing, 'goals_for', DETAIL_KEY_MAPPINGS.goalsFor, detailMap),
    goalsAgainst: resolveStat(standing, 'goals_against', DETAIL_KEY_MAPPINGS.goalsAgainst, detailMap),
    goalDifference: resolveStat(standing, 'goal_difference', DETAIL_KEY_MAPPINGS.goalDifference, detailMap),
    points: resolveStat(standing, 'points', DETAIL_KEY_MAPPINGS.points, detailMap),
  };

  const isFixtureTeam =
    typeof standing.participant_id === 'number' &&
    participantIds.includes(standing.participant_id ?? Number.NaN);

  const rowClass = isFixtureTeam
    ? 'bg-orange-500/10 font-semibold text-orange-700 dark:bg-orange-400/10 dark:text-orange-300'
    : '';

  return (
    <tr className={rowClass}>
      <td className="px-3 py-2 text-left text-sm text-foreground/80">{standing.position ?? '-'}</td>
      <td className="px-3 py-2 text-sm font-medium text-foreground">{resolveTeamName(standing)}</td>
      <td className="px-3 py-2 text-center text-sm text-foreground/80">{stats.played ?? '-'}</td>
      <td className="px-3 py-2 text-center text-sm text-foreground/80">{stats.wins ?? '-'}</td>
      <td className="px-3 py-2 text-center text-sm text-foreground/80">{stats.draws ?? '-'}</td>
      <td className="px-3 py-2 text-center text-sm text-foreground/80">{stats.losses ?? '-'}</td>
      <td className="px-3 py-2 text-center text-sm text-foreground/80">{stats.goalsFor ?? '-'}</td>
      <td className="px-3 py-2 text-center text-sm text-foreground/80">{stats.goalsAgainst ?? '-'}</td>
      <td className="px-3 py-2 text-center text-sm text-foreground/80">{stats.goalDifference ?? '-'}</td>
      <td className="px-3 py-2 text-center text-sm font-semibold text-foreground">{stats.points ?? '-'}</td>
      <td className="px-3 py-2 text-center text-sm text-muted-foreground">
        {standing.form ?? standing.result ?? detailMap.get('form') ?? '—'}
      </td>
    </tr>
  );
}

export function formatStandingsMeta(groups: ResolvedStandingGroup[]): string | null {
  if (!groups.length) {
    return null;
  }

  const totalTeams = groups.reduce((sum, group) => sum + group.standings.length, 0);
  const leader = groups[0]?.standings[0];
  if (!leader) return null;

  const leaderName = resolveTeamName(leader);
  const points =
    leader.points ??
    buildDetailMap(leader.details).get(normalizeDetailKey('overall_points') ?? '') ??
    null;

  const parts: string[] = [];
  if (leaderName) {
    parts.push(points ? `${leaderName} (${points} pts)` : leaderName);
  }
  if (totalTeams > 0) {
    parts.push(`${totalTeams} team${totalTeams === 1 ? '' : 's'}`);
  }

  return parts.length ? parts.join(' • ') : null;
}

