"use client";

import { useQuery } from "@tanstack/react-query";

export interface UseHeadToHeadParams {
  team1Id?: number | string | null;
  team2Id?: number | string | null;
  enabled?: boolean;
}

export function useHeadToHead({ team1Id, team2Id, enabled = true }: UseHeadToHeadParams) {
  return useQuery({
    queryKey: ["h2h", team1Id, team2Id, new Date().toISOString().slice(0, 10)],
    queryFn: async () => {
      const params = new URLSearchParams({
        team1Id: String(team1Id),
        team2Id: String(team2Id),
        per_page: "25",
      });
      const res = await fetch(`/api/sportmonks/fixtures/head-to-head?${params.toString()}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      return data;
    },
    enabled: Boolean(enabled && team1Id && team2Id),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 6, // 6 hours
    retry: 2,
    retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 10000),
  });
}


