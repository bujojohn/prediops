'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, Trophy } from 'lucide-react';
import { TeamLogo } from '@/app/components/ui/optimized-image';
import { cn } from '@/lib/utils';

type MarketKey = '1x2' | 'yesno';

type MarketDefinition = {
  key: MarketKey;
  label: string;
  options: { code: string; value: number | null }[];
};

function extractPrimaryMarket(predictions: Fixture['predictions'] | null | undefined) {
  if (!predictions || predictions.length === 0) return null;

  // Prefer a 1X2 market if available (keys home/away/draw)
  const threeWay = predictions.find((p: any) => p?.predictions &&
    Object.prototype.hasOwnProperty.call(p.predictions, 'home') &&
    Object.prototype.hasOwnProperty.call(p.predictions, 'away') &&
    Object.prototype.hasOwnProperty.call(p.predictions, 'draw')) as any;

  if (threeWay) {
    const m = threeWay.predictions as Record<string, number | null>;
    return {
      type: '1x2' as const,
      label: 'Full Time Result (1 X 2)',
      options: [
        { code: '1', value: m.home ?? null },
        { code: 'X', value: m.draw ?? null },
        { code: '2', value: m.away ?? null },
      ],
    };
  }

  // Fallback: yes/no market
  const yesNo = predictions.find((p: any) => p?.predictions &&
    Object.prototype.hasOwnProperty.call(p.predictions, 'yes') &&
    Object.prototype.hasOwnProperty.call(p.predictions, 'no')) as any;

  if (yesNo) {
    const m = yesNo.predictions as Record<string, number | null>;
    return {
      type: 'yesno' as const,
      label: 'Yes / No',
      options: [
        { code: 'Yes', value: m.yes ?? null },
        { code: 'No', value: m.no ?? null },
      ],
    };
  }

  return null;
}

function formatTimeOrState(fixture: Fixture): string {
  if (fixture.state?.short_name) return fixture.state.short_name;
  if (fixture.state?.name) return fixture.state.name;
  if (fixture.starting_at) {
    try {
      return new Date(fixture.starting_at).toLocaleTimeString();
    } catch (_) {
      return fixture.starting_at ?? '';
    }
  }
  return '';
}

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const [expanded, setExpanded] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [selectedMarketKey, setSelectedMarketKey] = useState<MarketKey | null>(null);
  const [showH2H, setShowH2H] = useState(false);

  const home = useMemo(
    () => fixture.participants?.find((p) => p.meta?.location === 'home'),
    [fixture.participants]
  );
  const away = useMemo(
    () => fixture.participants?.find((p) => p.meta?.location === 'away'),
    [fixture.participants]
  );

  const scoreHome = useMemo(
    () => fixture.scores?.find((s) => s.score?.participant === 'home')?.score?.goals ?? null,
    [fixture.scores]
  );
  const scoreAway = useMemo(
    () => fixture.scores?.find((s) => s.score?.participant === 'away')?.score?.goals ?? null,
    [fixture.scores]
  );

  const primaryMarket = useMemo(() => extractPrimaryMarket(fixture.predictions), [fixture.predictions]);

  const marketsMap: Record<MarketKey, MarketDefinition> | null = useMemo(() => {
    if (!fixture.predictions || fixture.predictions.length === 0) return null;
    const map = {} as Record<MarketKey, MarketDefinition>;
    const has1x2 = fixture.predictions.find((p: any) => p?.predictions && 'home' in p.predictions && 'away' in p.predictions && 'draw' in p.predictions) as any;
    if (has1x2) {
      const m = has1x2.predictions as Record<string, number | null>;
      map['1x2'] = {
        key: '1x2',
        label: 'Full Time Result (1 X 2)',
        options: [
          { code: '1', value: m.home ?? null },
          { code: 'X', value: m.draw ?? null },
          { code: '2', value: m.away ?? null },
        ],
      };
    }
    const hasYesNo = fixture.predictions.find((p: any) => p?.predictions && 'yes' in p.predictions && 'no' in p.predictions) as any;
    if (hasYesNo) {
      const m = hasYesNo.predictions as Record<string, number | null>;
      map['yesno'] = {
        key: 'yesno',
        label: 'Yes / No',
        options: [
          { code: 'Yes', value: m.yes ?? null },
          { code: 'No', value: m.no ?? null },
        ],
      };
    }
    return Object.keys(map).length > 0 ? map : null;
  }, [fixture.predictions]);

  useEffect(() => {
    if (!marketsMap) {
      setSelectedMarketKey(null);
      return;
    }
    // Prefer 1x2, else yes/no
    const preferred: MarketKey | null = marketsMap['1x2'] ? '1x2' : (marketsMap['yesno'] ? 'yesno' : null);
    setSelectedMarketKey(preferred);
  }, [marketsMap]);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header: state/time on left, date on right (mobile spec simplified) */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{formatTimeOrState(fixture)}</span>
          </div>
          {fixture.starting_at && (
            <span>{new Date(fixture.starting_at).toLocaleDateString()}</span>
          )}
        </div>

        {/* Teams (mobile stacked, desktop row) */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 md:items-center gap-3">
          <div className="flex items-center justify-between md:justify-start gap-3" onClick={() => setShowH2H(true)}>
            <div className="flex items-center gap-2 min-w-0">
              <TeamLogo src={home?.image_path || ''} alt={home?.name || 'Home'} className="rounded h-5 w-5" />
              <span className="font-medium truncate max-w-[60vw] sm:max-w-[40vw] md:max-w-[20vw]">{home?.name || 'Home'}</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 md:hidden">{scoreHome ?? '-'}</div>
          </div>

          <div className="hidden md:flex flex-col items-center">
            <div className="flex items-center gap-6">
              <div className="text-2xl font-bold text-blue-600">{scoreHome ?? '-'}</div>
              <div className="text-xs text-gray-500">VS</div>
              <div className="text-2xl font-bold text-blue-600">{scoreAway ?? '-'}</div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3" onClick={() => setShowH2H(true)}>
            <div className="flex items-center gap-2 min-w-0 order-1 md:order-none">
              <TeamLogo src={away?.image_path || ''} alt={away?.name || 'Away'} className="rounded h-5 w-5" />
              <span className="font-medium truncate max-w-[60vw] sm:max-w-[40vw] md:max-w-[20vw]">{away?.name || 'Away'}</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 md:hidden">{scoreAway ?? '-'}</div>
          </div>
        </div>

        {/* League */}
        {fixture.league?.name && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
            <Trophy className="h-3 w-3" />
            <span className="truncate">{fixture.league.name}</span>
          </div>
        )}

        {/* Market selection and probabilities */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              {selectedMarketKey && marketsMap ? marketsMap[selectedMarketKey]?.label : (primaryMarket?.label || 'Predictions')}
            </div>
            {marketsMap && (
              <div className="relative">
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setMarketOpen((v) => !v)}>
                  Markets
                  <ChevronDown className={cn('ml-1 h-4 w-4 transition-transform', marketOpen && 'rotate-180')} />
                </Button>
                {marketOpen && (
                  <div className="absolute right-0 mt-1 w-56 rounded-md border bg-white shadow-md z-10">
                    {Object.values(marketsMap).map((m) => (
                      <button
                        type="button"
                        key={m.key}
                        className={cn('w-full text-left px-3 py-2 text-sm hover:bg-gray-50', selectedMarketKey === m.key && 'bg-gray-50')}
                        onClick={() => { setSelectedMarketKey(m.key); setMarketOpen(false); }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Horizontally scrollable buttons */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(() => {
              const market = (selectedMarketKey && marketsMap) ? marketsMap[selectedMarketKey] : primaryMarket;
              return market?.options?.map((opt) => (
                <Button key={opt.code} variant="outline" size="sm" className="shrink-0">
                  <span className="mr-2">{opt.code}</span>
                  <span>{opt.value != null ? `${Number(opt.value).toFixed(2)}%` : '-'}</span>
                </Button>
              ));
            })()}
            {(!primaryMarket && !marketsMap) && (
              <div className="text-xs text-gray-500">No prediction market available</div>
            )}
          </div>
        </div>

        {/* Expand details (placeholder for H2H etc.) */}
        <div className="mt-3">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpanded((v) => !v)}>
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" /> Hide details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" /> Show details
              </>
            )}
          </Button>
          {expanded && (
            <div className="mt-2 border-t pt-3 text-xs text-gray-600 space-y-2">
              {fixture.venue?.name && (
                <div className="flex justify-between">
                  <span>Venue</span>
                  <span className="font-medium">{fixture.venue.name}</span>
                </div>
              )}
              {fixture.referee && (
                <div className="flex justify-between">
                  <span>Referee</span>
                  <span className="font-medium">Available</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      {/* H2H modal */}
      {showH2H && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowH2H(false)}>
          <div className="bg-white rounded-md shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b font-semibold">Head to Head</div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TeamLogo src={home?.image_path || ''} alt={home?.name || 'Home'} className="rounded h-6 w-6" />
                  <span className="font-medium">{home?.name || 'Home'}</span>
                </div>
                <div className="text-gray-400">vs</div>
                <div className="flex items-center gap-2">
                  <TeamLogo src={away?.image_path || ''} alt={away?.name || 'Away'} className="rounded h-6 w-6" />
                  <span className="font-medium">{away?.name || 'Away'}</span>
                </div>
              </div>
              <div className="text-gray-600">Head-to-head stats coming soon.</div>
            </div>
            <div className="p-3 border-t flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowH2H(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}


