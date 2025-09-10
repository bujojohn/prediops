"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type H2HFixture = {
  id: number | string;
  name?: string | null;
  starting_at?: string | null;
  scores?: unknown;
  league?: { name?: string | null } | null;
};

export interface H2HModalProps {
  open: boolean;
  onClose: () => void;
  team1Name?: string | null;
  team2Name?: string | null;
  isLoading: boolean;
  error?: string | null;
  fixtures: H2HFixture[];
  onViewFull?: () => void;
}

export function H2HModal({ open, onClose, team1Name, team2Name, isLoading, error, fixtures, onViewFull }: H2HModalProps) {
  if (!open) return null;

  const body = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-md shadow-xl w-full max-w-2xl sm:max-w-2xl md:max-w-xl" onClick={(e) => e.stopPropagation()}>
        <Card className="border-0 shadow-none">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">Head to Head</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3 text-sm">
              <div className="font-medium truncate">{team1Name || "Team 1"}</div>
              <div className="text-gray-400">vs</div>
              <div className="font-medium truncate text-right">{team2Name || "Team 2"}</div>
            </div>
            {isLoading ? (
              <div className="py-8 text-center text-gray-600">Loading head-to-head…</div>
            ) : error ? (
              <div className="py-6 px-3 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-sm text-center">
                Head-to-head data isn&apos;t available on the current subscription.
              </div>
            ) : fixtures.length === 0 ? (
              <div className="py-8 text-center text-gray-600">No recent meetings found.</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {fixtures.slice(0, 5).map((fx) => (
                  <li key={fx.id} className="py-2 flex items-center justify-between">
                    <span className="truncate mr-2">{fx.name || `Fixture ${fx.id}`}</span>
                    <span className="text-gray-500 text-xs">{fx.starting_at || ""}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-end gap-2">
              {onViewFull && (
                <Button variant="secondary" size="sm" onClick={onViewFull}>
                  View full H2H
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}

export default H2HModal;


