'use client';

import type { JSX } from 'react';

interface FixtureOddsProps {
  odds: unknown;
}

type RawOdd = {
  id?: number | null;
  name?: string | null;
  label?: string | null;
  value?: number | string | null;
  probability?: number | string | null;
};

type RawOddsEntry = {
  id?: number | null;
  name?: string | null;
  label?: string | null;
  value?: number | string | null;
  probability?: number | string | null;
  bookmaker?: { id?: number | null; name?: string | null } | null;
  market?: { id?: number | null; name?: string | null } | null;
  last_update?: string | null;
  odds?: RawOdd[] | null;
};

type OddsResponse = {
  data?: RawOddsEntry[];
} | null;

type MarketOutcome = {
  label: string;
  odd: number;
  bookmaker: string;
  impliedProbability?: number;
  lastUpdated?: string;
};

type NormalizedMarket = {
  key: string;
  name: string;
  outcomes: MarketOutcome[];
};

export function FixtureOdds({ odds }: FixtureOddsProps): JSX.Element {
  const oddsData = (odds ?? null) as OddsResponse;

  if (!oddsData?.data || oddsData.data.length === 0) {
    return <OddsFallback />;
  }

  const markets = normalizeMarkets(oddsData.data);

  if (markets.length === 0) {
    return <OddsFallback />;
  }

  return (
    <div className="space-y-6">
      {markets.map((market) => (
        <div
          key={market.key}
          className="rounded-xl border border-border/80 bg-card p-5 shadow-sm dark:border-border/60 dark:bg-card/90"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h4 className="text-base font-semibold text-foreground">
              {market.name}
            </h4>
            {renderLastUpdatedLabel(market.outcomes)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {market.outcomes.map((outcome) => (
              <div
                key={`${market.key}-${outcome.label}`}
                className="rounded-lg border border-border/70 bg-muted/40 p-4 dark:border-border/50 dark:bg-muted/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {outcome.label}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                    {outcome.bookmaker}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-semibold text-foreground">
                    {outcome.odd.toFixed(2)}
                  </span>
                  {outcome.impliedProbability !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {outcome.impliedProbability.toFixed(1)}% implied
                    </span>
                  )}
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, Math.max(5, (1 / outcome.odd) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function OddsFallback(): JSX.Element {
  return (
    <div className="rounded-xl border border-dashed border-border/70 py-10 text-center text-muted-foreground">
      Odds not available
    </div>
  );
}

function normalizeMarkets(entries: RawOddsEntry[]): NormalizedMarket[] {
  const marketMap = new Map<string, NormalizedMarket>();

  entries.forEach((entry) => {
    const marketName = entry.market?.name || entry.name || 'Market';
    const marketKey = `${entry.market?.id ?? marketName}`.toLowerCase();

    const outcomes = extractOutcomes(entry);
    if (outcomes.length === 0) {
      return;
    }

    const existing = marketMap.get(marketKey);
    if (existing) {
      mergeOutcomes(existing.outcomes, outcomes);
    } else {
      marketMap.set(marketKey, {
        key: marketKey,
        name: marketName,
        outcomes,
      });
    }
  });

  return Array.from(marketMap.values()).map((market) => ({
    ...market,
    outcomes: market.outcomes
      .sort((a, b) => b.odd - a.odd)
      .slice(0, 6),
  }));
}

function extractOutcomes(entry: RawOddsEntry): MarketOutcome[] {
  const bookmakerName = entry.bookmaker?.name || 'Unknown';
  const lastUpdated = entry.last_update ?? undefined;

  const outcomes: MarketOutcome[] = [];

  if (Array.isArray(entry.odds) && entry.odds.length > 0) {
    entry.odds.forEach((odd) => {
      const value = toNumber(odd.value ?? entry.value);
      if (value === null) {
        return;
      }

      outcomes.push({
        label: formatLabel(odd.label || odd.name || entry.label || entry.name || 'Outcome'),
        odd: value,
        bookmaker: bookmakerName,
        impliedProbability: toProbability(odd.probability ?? entry.probability ?? value),
        lastUpdated,
      });
    });
    return outcomes;
  }

  const value = toNumber(entry.value);
  if (value !== null) {
    outcomes.push({
      label: formatLabel(entry.label || entry.name || 'Outcome'),
      odd: value,
      bookmaker: bookmakerName,
      impliedProbability: toProbability(entry.probability ?? value),
      lastUpdated,
    });
  }

  return outcomes;
}

function mergeOutcomes(target: MarketOutcome[], incoming: MarketOutcome[]): void {
  incoming.forEach((outcome) => {
    const existing = target.find((item) => item.label === outcome.label);
    if (!existing || outcome.odd > existing.odd) {
      if (existing) {
        existing.odd = outcome.odd;
        existing.bookmaker = outcome.bookmaker;
        existing.impliedProbability = outcome.impliedProbability;
        existing.lastUpdated = outcome.lastUpdated ?? existing.lastUpdated;
      } else {
        target.push(outcome);
      }
    }
  });
}

function renderLastUpdatedLabel(outcomes: MarketOutcome[]): JSX.Element | null {
  const latest = outcomes
    .map((outcome) => outcome.lastUpdated)
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  if (!latest) {
    return null;
  }

  const formatted = safeFormatRelative(latest);
  if (!formatted) {
    return null;
  }

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      Updated {formatted}
    </span>
  );
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (!Number.isFinite(numeric) || numeric <= 1) {
    return null;
  }

  return Math.round(numeric * 100) / 100;
}

function toProbability(value: number | string | null | undefined): number | undefined {
  const numeric = toNumberAllowLessThanOne(value);
  if (numeric === null || numeric <= 0) {
    return undefined;
  }

  const probability = numeric <= 1 ? numeric * 100 : (1 / numeric) * 100;
  return Math.round(probability * 10) / 10;
}

function toNumberAllowLessThanOne(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric;
}

function formatLabel(label: string): string {
  return label
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function safeFormatRelative(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatRelativeToNow(date);
}

function formatRelativeToNow(date: Date): string | null {
  try {
    const now = new Date();
    const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

    const absSeconds = Math.abs(diffInSeconds);
    if (absSeconds < 60) {
      return rtf.format(diffInSeconds, 'second');
    }

    const diffInMinutes = diffInSeconds / 60;
    if (Math.abs(diffInMinutes) < 60) {
      return rtf.format(Math.round(diffInMinutes), 'minute');
    }

    const diffInHours = diffInMinutes / 60;
    if (Math.abs(diffInHours) < 24) {
      return rtf.format(Math.round(diffInHours), 'hour');
    }

    const diffInDays = diffInHours / 24;
    if (Math.abs(diffInDays) < 7) {
      return rtf.format(Math.round(diffInDays), 'day');
    }

    const diffInWeeks = diffInDays / 7;
    if (Math.abs(diffInWeeks) < 5) {
      return rtf.format(Math.round(diffInWeeks), 'week');
    }

    const diffInMonths = diffInDays / 30;
    if (Math.abs(diffInMonths) < 12) {
      return rtf.format(Math.round(diffInMonths), 'month');
    }

    const diffInYears = diffInDays / 365;
    return rtf.format(Math.round(diffInYears), 'year');
  } catch {
    return null;
  }
}
