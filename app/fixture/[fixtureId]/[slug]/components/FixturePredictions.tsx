'use client';

import type { JSX } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import type { Prediction } from '@/schemas/predictions.schema';
import { calculatePredictionStatus, type PredictionStatusResult } from '@/lib/utils/prediction-status';

type FixturePrediction = Prediction;
type PredictionWithDetails = FixturePrediction & {
  probability?: number | null;
  name?: string | null;
  type?: {
    name?: string | null;
    code?: string | null;
  } | null;
};

type ProbabilityItem = {
  label: string;
  percent: number;
  isPrimary?: boolean;
};

type PredictionCard = {
  key: string;
  title: string;
  subtitle?: string;
  items: ProbabilityItem[];
  status?: PredictionStatusResult;
};

interface FixturePredictionsProps {
  predictions: FixturePrediction[];
  fixture: Fixture;
}

export function FixturePredictions({ predictions, fixture }: FixturePredictionsProps): JSX.Element {
  if (!predictions || predictions.length === 0) {
    return <PredictionsFallback />;
  }

  const normalizedPredictions = dedupeByType((predictions ?? []) as PredictionWithDetails[]);
  const predictionStatuses = new Map<number, PredictionStatusResult>();

  normalizedPredictions.forEach((prediction) => {
    predictionStatuses.set(prediction.id, calculatePredictionStatus(prediction, fixture));
  });

  const homeTeam = fixture.participants?.find((participant) => participant.meta?.location === 'home');
  const awayTeam = fixture.participants?.find((participant) => participant.meta?.location === 'away');

  const matchOutcomePrediction = normalizedPredictions.find(isHomeAwayDrawPrediction);
const matchOutcomeStatus = matchOutcomePrediction
  ? predictionStatuses.get(matchOutcomePrediction.id)
  : undefined;
  const additionalPredictions = normalizedPredictions.filter((prediction) => prediction !== matchOutcomePrediction);

  const matchOutcomeItems = matchOutcomePrediction
    ? buildMatchOutcomeItems(matchOutcomePrediction, homeTeam?.name, awayTeam?.name)
    : [];

const cards = additionalPredictions
  .map((prediction) => buildPredictionCard(
    prediction,
    predictionStatuses.get(prediction.id)
  ))
  .filter((card): card is PredictionCard => card !== null && card.items.length > 0);

  if (matchOutcomeItems.length === 0 && cards.length === 0) {
    return <PredictionsFallback />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-6">AI Predictions</h3>

      {matchOutcomeItems.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Match Outcome Probability
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {matchOutcomeItems.map((item) => {
              const styles = getProbabilityStyles(matchOutcomeStatus, item.isPrimary);
              return (
              <div
                key={item.label}
                className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-center dark:border-primary/30 dark:bg-primary/10"
              >
                <div className="mb-1 text-xs uppercase tracking-wide text-primary">
                  {item.label}
                </div>
                <div className={`text-3xl font-bold ${styles.valueClass}`}>
                  {item.percent.toFixed(1)}%
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${styles.barClass}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.key}
              className="rounded-lg border border-border/80 bg-muted/40 p-4 dark:border-border/60 dark:bg-muted/10"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {card.title}
                </h4>
                {card.subtitle && (
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {card.subtitle}
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-3">
                {card.items.map((item) => {
                  const styles = getProbabilityStyles(card.status, item.isPrimary);
                  return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-foreground/90">{item.label}</span>
                      <span className={`text-sm font-semibold ${styles.valueClass}`}>
                        {item.percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                          className={`h-full rounded-full ${styles.barClass}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PredictionsFallback(): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">AI Predictions</h3>
      <p className="py-8 text-center text-muted-foreground">
        Predictions not available yet
      </p>
    </div>
  );
}

function dedupeByType(predictions: PredictionWithDetails[]): PredictionWithDetails[] {
  const map = new Map<number | string, PredictionWithDetails>();
  predictions.forEach((prediction) => {
    const key = prediction.type_id ?? prediction.type?.code ?? prediction.id;
    if (!map.has(key)) {
      map.set(key, prediction);
    }
  });
  return Array.from(map.values());
}

function isHomeAwayDrawPrediction(
  prediction: PredictionWithDetails
): prediction is PredictionWithDetails & {
  predictions: { home?: number | null; away?: number | null; draw?: number | null };
} {
  const data = prediction.predictions as Record<string, unknown> | undefined;
  return Boolean(
    data &&
      typeof data === 'object' &&
      ('home' in data || 'away' in data || 'draw' in data)
  );
}

function buildMatchOutcomeItems(
  prediction: PredictionWithDetails & {
    predictions: { home?: number | null; away?: number | null; draw?: number | null };
  },
  homeTeamName?: string | null,
  awayTeamName?: string | null
): ProbabilityItem[] {
  const homeRaw = prediction.predictions.home ?? null;
  const drawRaw = prediction.predictions.draw ?? null;
  const awayRaw = prediction.predictions.away ?? null;
  const homePercent = toPercent(homeRaw);
  const drawPercent = toPercent(drawRaw);
  const awayPercent = toPercent(awayRaw);

  const predictedKey = determineHighestKey([
    { key: 'home', value: homeRaw },
    { key: 'draw', value: drawRaw },
    { key: 'away', value: awayRaw },
  ]);
  const items: ProbabilityItem[] = [];

  if (homePercent !== null) {
    items.push({
      label: homeTeamName ? `${homeTeamName} Win` : 'Home Win',
      percent: homePercent,
      isPrimary: predictedKey === 'home',
    });
  }
  if (drawPercent !== null) {
    items.push({
      label: 'Draw',
      percent: drawPercent,
      isPrimary: predictedKey === 'draw',
    });
  }
  if (awayPercent !== null) {
    items.push({
      label: awayTeamName ? `${awayTeamName} Win` : 'Away Win',
      percent: awayPercent,
      isPrimary: predictedKey === 'away',
    });
  }

  return items;
}

function buildPredictionCard(
  prediction: PredictionWithDetails,
  status?: PredictionStatusResult
): PredictionCard | null {
  const items = extractProbabilityItems(prediction);
  if (items.length === 0) {
    return null;
  }

  const title = prediction.type?.name || prediction.name || 'Prediction';
  const subtitle = prediction.type?.code && prediction.type.code !== prediction.type?.name
    ? formatCode(prediction.type.code)
    : undefined;

  return {
    key: `${prediction.type_id ?? prediction.id}`,
    title,
    subtitle,
    items,
    status,
  };
}

function extractProbabilityItems(prediction: PredictionWithDetails): ProbabilityItem[] {
  const raw = prediction.predictions;
  if (!raw || typeof raw !== 'object') {
    return [];
  }

  if ('scores' in raw && isPlainRecord(raw.scores)) {
    return extractFromRecord(raw.scores, { limit: 6, treatScore: true });
  }

  if ('score' in raw && isPlainRecord(raw.score)) {
    return extractFromRecord(raw.score, { limit: 6, treatScore: true });
  }

  if (isPlainRecord(raw)) {
    return extractFromRecord(raw, { limit: 5 });
  }

  return [];
}

function extractFromRecord(
  record: Record<string, unknown>,
  options: { limit?: number; treatScore?: boolean } = {}
): ProbabilityItem[] {
  const { limit = 5, treatScore = false } = options;
  const items: ProbabilityItem[] = [];

  Object.entries(record).forEach(([key, value]) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return;
    }

    const percent = toPercent(value);
    if (percent === null) {
      return;
    }

    const label = treatScore ? formatScoreLabel(key) : formatPredictionLabel(key);
    items.push({ label, percent });
  });

  const sorted = items
    .sort((a, b) => b.percent - a.percent)
    .slice(0, limit);

  if (sorted.length > 0) {
    sorted[0].isPrimary = true;
  }

  return sorted;
}

function toPercent(value?: number | null): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  const normalized = value > 1 ? value : value * 100;
  const clamped = Math.max(0, Math.min(100, normalized));
  return Math.round(clamped * 10) / 10;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function determineHighestKey(
  entries: Array<{ key: 'home' | 'draw' | 'away'; value: number | null }>
): 'home' | 'draw' | 'away' | null {
  let highestKey: 'home' | 'draw' | 'away' | null = null;
  let highestValue = Number.NEGATIVE_INFINITY;

  entries.forEach(({ key, value }) => {
    if (value === null || value === undefined) {
      return;
    }
    const numeric = typeof value === 'string' ? Number.parseFloat(value) : value;
    if (!Number.isFinite(numeric)) {
      return;
    }
    if (numeric > highestValue) {
      highestValue = numeric;
      highestKey = key;
    }
  });

  return highestKey;
}

function formatPredictionLabel(label: string): string {
  const overUnder = label.match(/^(over|under)_(\d+)_(\d+)$/i);
  if (overUnder) {
    return `${capitalize(overUnder[1])} ${overUnder[2]}.${overUnder[3]}`;
  }

  const numericRange = label.match(/^(\d+)_([0-9x]+)$/i);
  if (numericRange) {
    return `${numericRange[1]}-${numericRange[2].replace(/_/g, '-')}`;
  }

  return capitalize(label.replace(/_/g, ' '));
}

function formatScoreLabel(label: string): string {
  if (/^\d+_\d+$/.test(label)) {
    return label.replace(/_/g, '-');
  }

  return formatPredictionLabel(label);
}

function formatCode(code: string): string {
  return code.replace(/_/g, ' ').toUpperCase();
}

function capitalize(value: string): string {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getProbabilityStyles(
  status: PredictionStatusResult | undefined,
  isPrimary?: boolean
): { valueClass: string; barClass: string } {
  const defaultValueClass = isPrimary ? 'text-primary' : 'text-muted-foreground';
  const defaultBarClass = 'bg-primary';

  if (!status || !isPrimary) {
    return { valueClass: defaultValueClass, barClass: defaultBarClass };
  }

  switch (status.status) {
    case 'success':
    case 'succeeding':
      return {
        valueClass: 'text-emerald-600 dark:text-emerald-400',
        barClass: 'bg-emerald-500 dark:bg-emerald-400',
      };
    case 'failed':
      return {
        valueClass: 'text-rose-600 dark:text-rose-400',
        barClass: 'bg-rose-500 dark:bg-rose-400',
      };
    default:
      return { valueClass: defaultValueClass, barClass: defaultBarClass };
  }
}
