import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Standing } from '@/schemas/standing.schema';
import { TeamLogo } from '@/app/components/ui/optimized-image';
import { cn } from '@/lib/utils';
import { generateTeamUrl } from '@/lib/utils/routing';

export type StandingsGroup = {
  name?: string | null;
  standings: Standing[];
};

type EmptyStateConfig = {
  title?: string;
  description?: string;
  icon?: ReactNode;
};

interface StandingsTableProps {
  groups: StandingsGroup[];
  highlightParticipantIds?: number[];
  variant?: 'full' | 'compact';
  showGroupLabels?: boolean;
  className?: string;
  showLogos?: boolean;
  showForm?: boolean;
  emptyState?: EmptyStateConfig | null;
}

export function StandingsTable({
  groups,
  highlightParticipantIds = [],
  variant = 'full',
  showGroupLabels = true,
  className,
  showLogos = true,
  showForm = true,
  emptyState,
}: StandingsTableProps) {
  const totalEntries = groups.reduce((sum, group) => sum + group.standings.length, 0);

  if (totalEntries === 0) {
    if (!emptyState) {
      return null;
    }

    return (
      <div className={cn('space-y-6', className)}>
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-center text-sm text-muted-foreground dark:border-border/40">
          {emptyState.icon ? <div className="mb-3 flex justify-center">{emptyState.icon}</div> : null}
          <h3 className="text-base font-semibold text-foreground">{emptyState.title ?? 'Standings not available'}</h3>
          {emptyState.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{emptyState.description}</p>
          ) : null}
        </div>
      </div>
    );
  }

  const highlightSet = new Set(highlightParticipantIds);

  return (
    <div className={cn('space-y-6', className)}>
      {groups.map((group, index) => {
        const orderedStandings = group.standings
          .slice()
          .sort((a, b) => (a.position ?? Number.POSITIVE_INFINITY) - (b.position ?? Number.POSITIVE_INFINITY));
        const groupLength = orderedStandings.length;
        const contextChips = buildGroupContextChips(orderedStandings[0]);

        return (
          <div key={group.name ?? `group-${index}`} className="space-y-4">
            {showGroupLabels && group.name ? (
              <h4 className="text-sm font-semibold text-foreground/90">{group.name}</h4>
            ) : null}
            {contextChips.length ? (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {contextChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/40 px-2.5 py-1 font-medium text-foreground/80 dark:bg-muted/10"
                  >
                    <span className="text-muted-foreground/80">{chip.label}:</span>
                    <span className="text-foreground">{chip.value}</span>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="hidden overflow-x-auto rounded-lg border border-border/60 bg-white shadow-sm dark:border-border/40 dark:bg-gray-900 md:block">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-muted/60 dark:bg-muted/20">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Pos</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Team</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">P</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">W</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">D</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">L</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">GF</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">GA</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">GD</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Pts</th>
                    {showForm ? (
                      <th className="px-3 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Form</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70 dark:divide-border/40">
                  {orderedStandings.map((standing, rowIndex) => {
                    const detailMap = buildDetailMap(standing.details);
                    const stats = resolveStats(standing, detailMap);
                    const goalDiff = resolveGoalDifference(stats);
                    const formTokens = showForm ? resolveFormSequence(standing, detailMap) : [];
                    const rowBadges = buildRowBadges(standing);

                    const isHighlighted =
                      typeof standing.participant_id === 'number' && highlightSet.has(standing.participant_id);

                    const isTopThree =
                      variant === 'full' && standing.position != null && standing.position > 0 && standing.position <= 3;
                    const isRelegationZone =
                      variant === 'full' &&
                      standing.position != null &&
                      standing.position > 0 &&
                      standing.position > groupLength - 3;

                    const rowClass = cn(
                      'transition-colors',
                      isHighlighted
                        ? 'bg-orange-500/10 text-orange-800 dark:bg-orange-400/10 dark:text-orange-200'
                        : isTopThree
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : isRelegationZone
                            ? 'bg-red-50 dark:bg-red-900/10'
                            : 'bg-transparent',
                    );

                    return (
                      <tr key={`${standing.participant_id ?? standing.id ?? rowIndex}`} className={rowClass}>
                        <td className="px-3 py-2 text-left text-sm font-semibold text-foreground/80">
                          {standing.position ?? '-'}
                        </td>
                        <td className="px-3 py-2 text-sm text-foreground">
                          <TeamCellContent
                            standing={standing}
                            showLogos={showLogos}
                            rowBadges={rowBadges}
                            variant="desktop"
                          />
                        </td>
                        <td className="px-3 py-2 text-center text-sm font-mono text-foreground/80">{stats.played ?? '-'}</td>
                        <td className="px-3 py-2 text-center text-sm font-mono text-green-600 dark:text-green-400">
                          {stats.wins ?? '-'}
                        </td>
                        <td className="px-3 py-2 text-center text-sm font-mono text-foreground/70">{stats.draws ?? '-'}</td>
                        <td className="px-3 py-2 text-center text-sm font-mono text-red-600 dark:text-red-400">
                          {stats.losses ?? '-'}
                        </td>
                        <td className="px-3 py-2 text-center text-sm font-mono text-foreground/80">
                          {stats.goalsFor ?? '-'}
                        </td>
                        <td className="px-3 py-2 text-center text-sm font-mono text-foreground/80">
                          {stats.goalsAgainst ?? '-'}
                        </td>
                        <td className="px-3 py-2 text-center text-sm font-mono">
                          <span
                            className={cn(
                              'font-semibold',
                              goalDiff == null
                                ? 'text-foreground/70'
                                : goalDiff > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : goalDiff < 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-foreground/80',
                            )}
                          >
                            {goalDiff != null && goalDiff > 0 ? '+' : ''}
                            {goalDiff ?? '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center text-sm">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                            {stats.points ?? '-'}
                          </span>
                        </td>
                        {showForm ? (
                          <td className="px-3 py-2 text-center text-sm">
                            {formTokens.length ? (
                              <div className="flex justify-center gap-1">
                                {formTokens.slice(-5).map((token, tokenIndex) => (
                                  <span
                                    key={`${standing.participant_id ?? standing.id ?? rowIndex}-form-${tokenIndex}`}
                                    className={cn(
                                      'inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
                                      token === 'W'
                                        ? 'bg-green-500 text-white'
                                        : token === 'D'
                                          ? 'bg-gray-500 text-white'
                                          : token === 'L'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
                                    )}
                                  >
                                    {token}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {orderedStandings.map((standing, rowIndex) => {
                const detailMap = buildDetailMap(standing.details);
                const stats = resolveStats(standing, detailMap);
                const goalDiff = resolveGoalDifference(stats);
                const formTokens = showForm ? resolveFormSequence(standing, detailMap) : [];
                const rowBadges = buildRowBadges(standing);

                const isHighlighted =
                  typeof standing.participant_id === 'number' && highlightSet.has(standing.participant_id);

                const isTopThree =
                  variant === 'full' && standing.position != null && standing.position > 0 && standing.position <= 3;
                const isRelegationZone =
                  variant === 'full' &&
                  standing.position != null &&
                  standing.position > 0 &&
                  standing.position > groupLength - 3;

                const cardClass = cn(
                  'space-y-3 rounded-lg border p-4',
                  isHighlighted
                    ? 'border-orange-300 bg-orange-50 dark:border-orange-500/60 dark:bg-orange-500/10'
                    : isTopThree
                      ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                      : isRelegationZone
                        ? 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                        : 'border-border/60 bg-white dark:border-border/40 dark:bg-gray-900',
                );

                return (
                  <div key={`${standing.participant_id ?? standing.id ?? rowIndex}`} className={cardClass}>
                    <div className="flex items-center justify-between gap-4">
                      <TeamCellContent
                        standing={standing}
                        showLogos={showLogos}
                        rowBadges={rowBadges}
                        variant="mobile"
                      />
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white text-lg font-bold">
                        {stats.points ?? '-'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <StatRow label="Played" value={stats.played} />
                        <StatRow label="Won" value={stats.wins} valueClass="text-green-600 dark:text-green-400" />
                        <StatRow label="Drawn" value={stats.draws} />
                      </div>
                      <div className="space-y-2">
                        <StatRow label="Lost" value={stats.losses} valueClass="text-red-600 dark:text-red-400" />
                        <StatRow label="GF" value={stats.goalsFor} />
                        <StatRow label="GA" value={stats.goalsAgainst} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Goal Diff</span>
                        <div
                          className={cn(
                            'font-semibold',
                            goalDiff == null
                              ? 'text-foreground/70'
                              : goalDiff > 0
                                ? 'text-green-600 dark:text-green-400'
                                : goalDiff < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-foreground/80',
                          )}
                        >
                          {goalDiff != null && goalDiff > 0 ? '+' : ''}
                          {goalDiff ?? '-'}
                        </div>
                      </div>

                      {showForm ? (
                        <div className="text-right">
                          <span className="text-muted-foreground">Form</span>
                          {formTokens.length ? (
                            <div className="mt-2 flex justify-end gap-1">
                              {formTokens.slice(-5).map((token, tokenIndex) => (
                                <span
                                  key={`${standing.participant_id ?? standing.id ?? rowIndex}-mobile-form-${tokenIndex}`}
                                  className={cn(
                                    'inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
                                    token === 'W'
                                      ? 'bg-green-500 text-white'
                                      : token === 'D'
                                        ? 'bg-gray-500 text-white'
                                        : token === 'L'
                                          ? 'bg-red-500 text-white'
                                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
                                  )}
                                >
                                  {token}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 text-xs text-muted-foreground">-</div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: number | null;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-mono font-semibold text-foreground', valueClass)}>{value ?? '-'}</span>
    </div>
  );
}

const DETAIL_KEY_MAPPINGS: Record<
  'played' | 'wins' | 'draws' | 'losses' | 'goalsFor' | 'goalsAgainst' | 'goalDifference' | 'points',
  string[]
> = {
  played: [
    'overall_matches_played',
    'overall-matches-played',
    'overall_played',
    'played',
    'overall_gp',
    'total_played',
    'matches_played',
    'overall_matches',
  ],
  wins: ['overall_won', 'overall-won', 'won', 'overall_wins', 'wins'],
  draws: ['overall_draw', 'overall-draw', 'draw', 'overall_draws', 'drawn'],
  losses: ['overall_lost', 'overall-lost', 'lost', 'overall_losses', 'losses'],
  goalsFor: ['overall_scored', 'overall-scored', 'scored', 'gf', 'goals_scored', 'overall_goals_for', 'overall-goals-for'],
  goalsAgainst: [
    'overall_against',
    'overall-against',
    'against',
    'ga',
    'goals_against',
    'overall_goals_against',
    'overall-goals-against',
    'overall_conceded',
  ],
  goalDifference: ['overall_goal_difference', 'goal_difference', 'goal-difference', 'gd'],
  points: ['overall_points', 'overall-points', 'points', 'total_points'],
};

function normalizeDetailKey(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.toLowerCase().trim().replace(/[\s-]+/g, '_');
}

function buildDetailMap(details: Standing['details']): Map<string, number> {
  const map = new Map<string, number>();
  if (!details) return map;

  const collect = (input: unknown): void => {
    if (!input) return;

    if (Array.isArray(input)) {
      input.forEach((entry) => collect(entry));
      return;
    }

    if (typeof input !== 'object') {
      return;
    }

    const record = input as Record<string, unknown>;

    if ('value' in record && ('type' in record || 'standing_type' in record)) {
      const detail = record as {
        value: unknown;
        standing_type?: string | null;
        type?: { code?: string | null; name?: string | null; developer_name?: string | null; stat_group?: string | null };
      };

      const candidates = [
        normalizeDetailKey(detail.standing_type),
        normalizeDetailKey(detail.type?.code),
        normalizeDetailKey(detail.type?.name),
        normalizeDetailKey(detail.type?.developer_name),
      ].filter(Boolean) as string[];

      const statGroup = normalizeDetailKey(detail.type?.stat_group);
      const numericValue = coerceNumber(detail.value);

      if (numericValue != null) {
        candidates.forEach((candidate) => {
          map.set(candidate, numericValue);
          if (statGroup) {
            map.set(`${statGroup}_${candidate}`, numericValue);
          }
        });
      }

      return;
    }

    if ('data' in record) {
      collect(record.data);
    }

    Object.values(record).forEach((value) => {
      if (value && typeof value === 'object') {
        collect(value);
      }
    });
  };

  collect(details);

  return map;
}

function resolveStats(standing: Standing, detailMap: Map<string, number>) {
  return {
    played: resolveStat(standing, 'games_played', DETAIL_KEY_MAPPINGS.played, detailMap),
    wins: resolveStat(standing, 'wins', DETAIL_KEY_MAPPINGS.wins, detailMap),
    draws: resolveStat(standing, 'draws', DETAIL_KEY_MAPPINGS.draws, detailMap),
    losses: resolveStat(standing, 'losses', DETAIL_KEY_MAPPINGS.losses, detailMap),
    goalsFor: resolveStat(standing, 'goals_for', DETAIL_KEY_MAPPINGS.goalsFor, detailMap),
    goalsAgainst: resolveStat(standing, 'goals_against', DETAIL_KEY_MAPPINGS.goalsAgainst, detailMap),
    goalDifference: resolveStat(standing, 'goal_difference', DETAIL_KEY_MAPPINGS.goalDifference, detailMap),
    points: resolveStat(standing, 'points', DETAIL_KEY_MAPPINGS.points, detailMap),
  };
}

function resolveGoalDifference(stats: ReturnType<typeof resolveStats>): number | null {
  if (stats.goalDifference != null) {
    return stats.goalDifference;
  }

  if (stats.goalsFor != null && stats.goalsAgainst != null) {
    return stats.goalsFor - stats.goalsAgainst;
  }

  return null;
}

function resolveStat(
  standing: Standing,
  field: keyof Standing,
  detailKeys: string[],
  detailMap: Map<string, number>,
): number | null {
  const direct = coerceNumber(standing[field] as unknown);
  if (direct != null) {
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

function resolveFormSequence(standing: Standing, detailMap: Map<string, number>): string[] {
  const formValue = standing.form as unknown;

  if (typeof formValue === 'string') {
    return formValue.replace(/\s+/g, '').split('').map(formatFormToken).filter(Boolean) as string[];
  }

  if (Array.isArray(formValue)) {
    return formValue
      .slice()
      .sort((a, b) => extractSortOrder(a) - extractSortOrder(b))
      .map((value) => {
        if (typeof value === 'string') {
          return value.trim();
        }
        if (value && typeof value === 'object') {
          if ('form' in value) {
            const token = (value as { form?: unknown }).form;
            return typeof token === 'string' ? token.trim() : String(token ?? '').trim();
          }
          return String(value ?? '').trim();
        }
        return String(value ?? '').trim();
      })
      .filter(Boolean)
      .map((value) => formatFormToken(value));
  }

  if (Array.isArray(standing.form_details) && standing.form_details.length > 0) {
    return standing.form_details
      .slice()
      .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
      .map((entry) => formatFormToken(entry?.form))
      .filter(Boolean) as string[];
  }

  if (detailMap.has('form')) {
    const formDetail = detailMap.get('form');
    if (formDetail != null) {
      return String(formDetail)
        .replace(/\s+/g, '')
        .split('')
        .map(formatFormToken)
        .filter(Boolean) as string[];
    }
  }

  return [];
}

function formatFormToken(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) {
    return '';
  }
  return trimmed.charAt(0);
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  return null;
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

type StatusTone = 'neutral' | 'success' | 'danger' | 'info' | 'warning';

function TeamCellContent({
  standing,
  showLogos,
  rowBadges,
  variant,
}: {
  standing: Standing;
  showLogos: boolean;
  rowBadges: Array<{ key: string; label: string; tone: StatusTone }>;
  variant: 'desktop' | 'mobile';
}): ReactNode {
  const teamName = resolveTeamName(standing);
  const teamLink = resolveTeamLink(standing, teamName);

  const content = (
    <div className={cn('flex items-center gap-3', variant === 'mobile' ? 'w-full' : undefined)}>
      {variant === 'mobile' ? (
        <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground dark:bg-gray-800">
          {standing.position ?? '-'}
        </span>
      ) : null}
      {showLogos ? (
        <TeamLogo
          src={standing.participant?.image_path ?? undefined}
          alt={standing.participant?.name || 'Team'}
          className={cn('flex-shrink-0', variant === 'mobile' ? 'h-8 w-8' : 'h-6 w-6')}
        />
      ) : null}
      <div className="min-w-0">
        <div
          className={cn(
            'truncate font-medium text-foreground',
            teamLink ? 'group-hover:text-orange-600 dark:group-hover:text-orange-400' : undefined,
          )}
        >
          {teamName}
        </div>
        {rowBadges.length ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {rowBadges.map((badge) => (
              <StatusBadge key={`${badge.key}-${variant}`} label={badge.label} tone={badge.tone} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (teamLink) {
    return (
      <Link href={teamLink} className="group block w-full">
        {content}
      </Link>
    );
  }

  return content;
}

function resolveTeamLink(standing: Standing, fallbackName: string): string | null {
  const rawId = standing.participant?.id ?? standing.participant_id;
  if (rawId == null) {
    return null;
  }

  const numericId = typeof rawId === 'string' ? Number(rawId) : rawId;
  if (!Number.isFinite(numericId)) {
    return null;
  }

  const name = standing.participant?.name ?? fallbackName;
  return generateTeamUrl({ id: numericId, name });
}

function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  const toneClasses: Record<StatusTone, string> = {
    neutral: 'bg-muted/60 text-muted-foreground dark:bg-muted/20',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-300',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-tight',
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  );
}

function buildRowBadges(standing: Standing): Array<{ key: string; label: string; tone: StatusTone }> {
  const badges: Array<{ key: string; label: string; tone: StatusTone }> = [];

  const ruleName = standing.rule?.type?.name ?? standing.rule?.type?.developer_name;
  if (ruleName) {
    badges.push({
      key: `rule-${standing.rule?.type?.id ?? ruleName}`,
      label: ruleName,
      tone: classifyStatusTone(ruleName),
    });
  }

  const result = standing.result;
  if (result && result.toLowerCase() !== 'equal') {
    badges.push({
      key: `result-${standing.id ?? result}`,
      label: result,
      tone: classifyStatusTone(result),
    });
  }

  return badges;
}

function classifyStatusTone(input: string): StatusTone {
  const normalized = input.toLowerCase();

  if (normalized.match(/champ|winner|promotion|qualifi|champions|title/)) {
    return 'success';
  }

  if (normalized.match(/releg|descens|drop|demotion/)) {
    return 'danger';
  }

  if (normalized.match(/play[-\s]?off|playoff|europe|conference|continental|qualification/)) {
    return 'info';
  }

  if (normalized.match(/pending|tbd|equal/)) {
    return 'neutral';
  }

  return 'neutral';
}

function buildGroupContextChips(
  standing: Standing | undefined,
): Array<{ key: string; label: string; value: string }> {
  if (!standing) return [];

  const chips: Array<{ key: string; label: string; value: string }> = [];

  const leagueName = standing.league?.name;
  if (leagueName) {
    chips.push({ key: `league-${leagueName}`, label: 'League', value: leagueName });
  }

  const seasonName = standing.round?.season?.name;
  if (seasonName) {
    chips.push({ key: `season-${seasonName}`, label: 'Season', value: seasonName });
  }

  const stageName = standing.stage?.name;
  if (stageName) {
    chips.push({ key: `stage-${stageName}`, label: 'Stage', value: stageName });
  }

  const stageType = standing.stage?.type?.name;
  if (stageType && stageType !== stageName) {
    chips.push({ key: `stage-type-${stageType}`, label: 'Stage Type', value: stageType });
  }

  const roundName = standing.round?.name;
  if (roundName) {
    chips.push({ key: `round-${roundName}`, label: 'Round', value: roundName });
  }

  return chips;
}

function extractSortOrder(value: unknown): number {
  if (value && typeof value === 'object' && 'sort_order' in value) {
    const order = (value as { sort_order?: unknown }).sort_order;
    const numeric = typeof order === 'number' ? order : Number(order);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return 0;
}

export function formatStandingsMeta(groups: StandingsGroup[]): string | null {
  if (!groups.length) {
    return null;
  }

  const totalTeams = groups.reduce((sum, group) => sum + group.standings.length, 0);
  const leader = groups[0]?.standings[0];
  if (!leader) return null;

  const detailMap = buildDetailMap(leader.details);
  const leaderName = resolveTeamName(leader);
  const points =
    coerceNumber(leader.points) ??
    detailMap.get('overall_points') ??
    detailMap.get('points') ??
    null;

  const leagueName = leader.league?.name;
  const seasonName = leader.round?.season?.name;
  const stageName = leader.stage?.name;
  const stageType = leader.stage?.type?.name;

  const parts: string[] = [];

  if (seasonName) {
    parts.push(`Season ${seasonName}`);
  }

  if (leagueName) {
    parts.push(leagueName);
  }

  if (stageName) {
    parts.push(stageType && stageType !== stageName ? `Stage ${stageName} (${stageType})` : `Stage ${stageName}`);
  } else if (stageType) {
    parts.push(`Stage Type ${stageType}`);
  }

  if (leaderName) {
    parts.push(points != null ? `Leader ${leaderName} (${points} pts)` : `Leader ${leaderName}`);
  }

  if (totalTeams > 0) {
    parts.push(`${totalTeams} team${totalTeams === 1 ? '' : 's'}`);
  }

  return parts.length ? parts.join(' • ') : null;
}


