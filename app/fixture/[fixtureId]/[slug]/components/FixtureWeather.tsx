import Image from 'next/image';
import type { WeatherReport } from '@/schemas/weather-report.schema';

interface FixtureWeatherProps {
  weatherReport: WeatherReport;
}

type WeatherEntry = {
  label: string;
  value: string;
};

const metricConfig: Array<{
  keys: string[];
  label: string;
  formatter?: (value: unknown) => string;
}> = [
  {
    keys: ['temperature_celcius', 'temperature_celsius'],
    label: 'Temperature (°C)',
    formatter: (value) => appendUnit(value, '°C') ?? formatValue(value),
  },
  {
    keys: ['temperature_fahrenheit'],
    label: 'Temperature (°F)',
    formatter: (value) => appendUnit(value, '°F') ?? formatValue(value),
  },
  {
    keys: ['weather_condition', 'weather_description'],
    label: 'Condition',
  },
  {
    keys: ['wind_speed'],
    label: 'Wind Speed (km/h)',
    formatter: (value) => appendUnit(value, 'km/h', { spacing: true }) ?? formatValue(value),
  },
  {
    keys: ['wind_speed_miles'],
    label: 'Wind Speed (mph)',
    formatter: (value) => appendUnit(value, 'mph', { spacing: true }) ?? formatValue(value),
  },
  {
    keys: ['wind_direction'],
    label: 'Wind Direction',
  },
  {
    keys: ['humidity'],
    label: 'Humidity',
    formatter: (value) => appendUnit(value, '%') ?? formatValue(value),
  },
  {
    keys: ['pressure'],
    label: 'Pressure',
    formatter: (value) => appendUnit(value, 'hPa', { spacing: true }) ?? formatValue(value),
  },
  {
    keys: ['cloud_cover', 'clouds'],
    label: 'Cloud Cover',
    formatter: (value) => appendUnit(value, '%') ?? formatValue(value),
  },
  {
    keys: ['precipitation', 'rain'],
    label: 'Precipitation',
    formatter: (value) => appendUnit(value, 'mm', { spacing: true }) ?? formatValue(value),
  },
  {
    keys: ['snow'],
    label: 'Snow',
    formatter: (value) => appendUnit(value, 'mm', { spacing: true }) ?? formatValue(value),
  },
];

export function FixtureWeather({ weatherReport }: FixtureWeatherProps) {
  const normalized = weatherReport ?? {};
  const primaryEntries: WeatherEntry[] = [];

  metricConfig.forEach(({ keys, label, formatter }) => {
    const key = keys.find((candidate) => hasValue(normalized, candidate));
    if (!key) return;

    const rawValue = (normalized as Record<string, unknown>)[key];
    const value = formatter ? formatter(rawValue) : formatNumericValue(rawValue);
    if (!value) return;
    primaryEntries.push({ label, value });
  });

  const remainingEntries = Object.entries(normalized)
    .filter(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return false;
      }
      if (key === 'icon' || key === 'icon_path' || key === 'updated_at') {
        return false;
      }
      return !metricConfig.some((config) => config.keys.includes(key));
    })
    .map(([key, value]) => ({
      label: toLabel(key),
      value: formatNumericValue(value) ?? formatValue(value),
    }))
    .filter((entry): entry is WeatherEntry => Boolean(entry.value));

  const iconUrl =
    typeof (normalized as Record<string, unknown>).icon === 'string'
      ? ((normalized as Record<string, string>).icon)
      : typeof (normalized as Record<string, unknown>).icon_path === 'string'
        ? ((normalized as Record<string, string>).icon_path)
        : undefined;

  const updatedAt =
    typeof (normalized as Record<string, unknown>).updated_at === 'string'
      ? String((normalized as Record<string, string>).updated_at)
      : undefined;

  if (primaryEntries.length === 0 && remainingEntries.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow-sm dark:bg-gray-800">
        <h3 className="text-lg font-semibold">Matchday Weather</h3>
        <p className="mt-4 text-sm text-muted-foreground">
          Weather data is not available for this fixture.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Matchday Weather</h3>
          <p className="text-sm text-muted-foreground">
            Forecast for the scheduled kickoff time.
          </p>
          {updatedAt ? (
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              Updated: {new Date(updatedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt="Weather icon"
            width={64}
            height={64}
            className="h-16 w-16 self-start rounded-lg bg-muted p-2 dark:bg-gray-700"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {primaryEntries.map((entry) => (
          <div
            key={entry.label}
            className="rounded-lg border border-border/70 bg-muted/40 p-4 dark:border-border/60 dark:bg-muted/10"
          >
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {entry.label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-foreground">
              {entry.value}
            </div>
          </div>
        ))}
      </div>

      {remainingEntries.length > 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border/60 p-4 dark:border-border/40">
          <h4 className="text-sm font-semibold text-foreground">Additional Details</h4>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {remainingEntries.map((entry) => (
              <div key={entry.label}>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {entry.label}
                </dt>
                <dd className="text-sm text-foreground">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

function hasValue(source: Record<string, unknown>, key: string): boolean {
  const value = source[key];
  return value !== null && value !== undefined && value !== '';
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return '';
}

function formatNumericValue(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]+/g, '');
    if (cleaned.length === 0) {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    }

    const parsed = Number(cleaned);
    if (!Number.isNaN(parsed)) {
      return parsed.toLocaleString();
    }

    return value.trim() || undefined;
  }

  return undefined;
}

function toLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function appendUnit(value: unknown, unit: string, options?: { spacing?: boolean }): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const spacing = options?.spacing ?? false;
  const separator = spacing ? ' ' : '';

  if (typeof value === 'number') {
    return `${value.toLocaleString()}${separator}${unit}`;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const normalizedUnit = unit.toLowerCase();
    if (trimmed.toLowerCase().includes(normalizedUnit) || trimmed.includes('%') || trimmed.includes('°')) {
      return trimmed;
    }

    const cleaned = trimmed.replace(/[^\d.-]+/g, '');
    if (cleaned.length) {
      const numeric = Number(cleaned);
      if (!Number.isNaN(numeric)) {
        return `${numeric.toLocaleString()}${separator}${unit}`;
      }
    }

    return `${trimmed}${separator}${unit}`;
  }

  return undefined;
}

