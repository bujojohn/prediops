"use client";

import { useQuery } from "@tanstack/react-query";
import type { ValueBet } from "@/schemas/valuebet.schema";

export interface UseValueBetParams {
  fixtureId?: number | string | null;
  enabled?: boolean;
}

export interface ValueBetResponse {
  success: boolean;
  data: {
    data: ValueBet[];
    pagination?: unknown;
  };
  message?: string;
}

export function useValueBet({ fixtureId, enabled = true }: UseValueBetParams) {
  return useQuery({
    queryKey: ["valuebet", fixtureId],
    queryFn: async (): Promise<ValueBetResponse> => {
      const res = await fetch(`/api/sportmonks/value-bets/fixture/${fixtureId}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return res.json();
    },
    enabled: Boolean(enabled && fixtureId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
  });
}
