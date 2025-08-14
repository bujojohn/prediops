import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

// Deterministic, SSR/CSR-stable date utilities (explicit locale + UTC)
export function formatDateUTC(dateInput: string | number | Date): string {
  try {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  } catch {
    return String(dateInput ?? '');
  }
}

export function formatTimeUTC(dateInput: string | number | Date): string {
  try {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return String(dateInput ?? '');
  }
}

export function dateKeyUTC(dateInput: string | number | Date): string {
  try {
    const d = new Date(dateInput);
    // YYYY-MM-DD in UTC
    const iso = d.toISOString();
    return iso.slice(0, 10);
  } catch {
    return String(dateInput ?? '');
  }
}

function getOrdinal(day: number): string {
  const tens = day % 100;
  if (tens >= 11 && tens <= 13) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
}

export function formatSemanticDateUTC(dateInput: string | number | Date, nowInput?: string | number | Date): string {
  try {
    const date = new Date(dateInput);
    const now = nowInput ? new Date(nowInput) : new Date();
    // Use UTC day comparison to avoid TZ drift
    const dKey = dateKeyUTC(date);
    const nKey = dateKeyUTC(now);

    // tomorrow
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const yKey = dateKeyUTC(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)));
    const tmrKey = dateKeyUTC(tomorrow);

    if (dKey === nKey) return 'Today';
    if (dKey === tmrKey) return 'Tomorrow';
    if (dKey === yKey) return 'Yesterday';

    const day = date.getUTCDate();
    const month = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(date);
    return `${getOrdinal(day)} ${month}`;
  } catch {
    return String(dateInput ?? '');
  }
}