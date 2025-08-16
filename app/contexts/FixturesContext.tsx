import React, { createContext, useContext, useState } from 'react';
import type { Fixture } from '@/schemas/fixture.schema';

interface FixturesContextValue {
  fixtures: Fixture[];
  setFixtures: (fixtures: Fixture[]) => void;
}

export const FixturesContext = createContext<FixturesContextValue | undefined>(undefined);

export function FixturesProvider({ children, initialFixtures = [] }: { children: React.ReactNode; initialFixtures?: Fixture[] }) {
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures);
  return (
    <FixturesContext.Provider value={{ fixtures, setFixtures }}>
      {children}
    </FixturesContext.Provider>
  );
}

export function useFixtures() {
  const ctx = useContext(FixturesContext);
  if (!ctx) throw new Error('useFixtures must be used within a FixturesProvider');
  return ctx;
}
