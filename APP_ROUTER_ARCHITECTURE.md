# 🏗️ Next.js App Router Architecture for SportMonks Integration

## 📋 **Overview**
This document outlines the **Next.js App Router architecture** for the PrediOps project, optimized for SportMonks API integration with modern patterns and best practices.

---

## 🎯 **App Router Benefits for SportMonks**

### **Server-Side Security**
- ✅ **API tokens secure**: Server Components keep credentials on the server
- ✅ **No client exposure**: SportMonks API token never sent to browser
- ✅ **Direct API calls**: Server-to-server communication for better performance

### **Performance Optimization**
- ✅ **Server Components by default**: Faster initial page loads
- ✅ **Streaming**: Progressive loading of predictions data
- ✅ **Built-in caching**: Automatic caching of SportMonks responses
- ✅ **ISR support**: Incremental Static Regeneration for updated predictions

### **Developer Experience**
- ✅ **File-based routing**: Intuitive URL structure
- ✅ **Co-located components**: Components next to routes that use them
- ✅ **TypeScript integration**: Full type safety with SportMonks interfaces
- ✅ **Built-in error handling**: Automatic error boundaries

---

## 📁 **Complete Project Structure**

```
app/                              # App Router directory
├── api/                          # API Routes (Server-side)
│   └── sportmonks/
│       ├── predictions/
│       │   ├── route.ts          # GET /api/sportmonks/predictions
│       │   ├── [id]/route.ts     # GET /api/sportmonks/predictions/[id]
│       │   └── latest/route.ts   # GET /api/sportmonks/predictions/latest
│       ├── value-bets/
│       │   └── route.ts          # GET /api/sportmonks/value-bets
│       ├── fixtures/
│       │   ├── route.ts          # GET /api/sportmonks/fixtures
│       │   ├── live/route.ts     # GET /api/sportmonks/fixtures/live
│       │   └── [date]/route.ts   # GET /api/sportmonks/fixtures/[date]
│       ├── teams/
│       │   └── [id]/route.ts     # GET /api/sportmonks/teams/[id]
│       └── leagues/
│           └── [id]/route.ts     # GET /api/sportmonks/leagues/[id]
├── (dashboard)/                  # Route group for dashboard layout
│   ├── predictions/
│   │   ├── page.tsx              # /predictions
│   │   ├── [id]/page.tsx         # /predictions/[id]
│   │   ├── loading.tsx           # Loading UI for predictions
│   │   └── error.tsx             # Error UI for predictions
│   ├── live/
│   │   ├── page.tsx              # /live
│   │   ├── loading.tsx           # Loading UI for live matches
│   │   └── error.tsx             # Error UI for live matches
│   ├── value-bets/
│   │   ├── page.tsx              # /value-bets
│   │   ├── loading.tsx           # Loading UI
│   │   └── error.tsx             # Error UI
│   ├── analytics/                # Future xG features
│   │   ├── page.tsx              # /analytics
│   │   ├── teams/
│   │   │   └── [id]/page.tsx     # /analytics/teams/[id]
│   │   ├── loading.tsx           # Loading UI
│   │   └── error.tsx             # Error UI
│   └── layout.tsx                # Dashboard layout with navigation
├── components/                   # Reusable Components
│   ├── predictions/
│   │   ├── PredictionCard.tsx
│   │   ├── PredictionsList.tsx
│   │   ├── PredictionDetails.tsx
│   │   └── PredictionFilters.tsx
│   ├── matches/
│   │   ├── LiveScore.tsx
│   │   ├── FixtureList.tsx
│   │   ├── MatchCard.tsx
│   │   └── MatchDetails.tsx
│   ├── value-bets/
│   │   ├── ValueBetCard.tsx
│   │   ├── ValueBetsList.tsx
│   │   └── BetComparison.tsx
│   ├── analytics/                # Future xG components
│   │   ├── XGChart.tsx
│   │   ├── TrendsGraph.tsx
│   │   ├── TeamComparison.tsx
│   │   └── PlayerAnalysis.tsx
│   └── ui/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── Navigation.tsx
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/                          # Utilities & Services
│   ├── sportmonks.ts             # SportMonks API client
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # Helper functions
│   ├── errors.ts                 # Custom error classes
│   ├── cache.ts                  # Caching utilities
│   └── validations.ts            # Data validation schemas
├── hooks/                        # Custom React Hooks
│   ├── usePredictions.ts         # Predictions data hook
│   ├── useValueBets.ts           # Value bets data hook
│   ├── useLiveMatches.ts         # Live matches hook
│   └── useLocalStorage.ts        # Local storage hook
├── globals.css                   # Global styles
├── layout.tsx                    # Root layout
├── page.tsx                      # Home page (/)
├── loading.tsx                   # Global loading UI
├── error.tsx                     # Global error UI
├── not-found.tsx                 # 404 page
└── sitemap.ts                    # Dynamic sitemap generation
```

---

## 🛠 **Core Implementation Patterns**

### **1. Server Components for Data Fetching**
```typescript
// app/(dashboard)/predictions/page.tsx
import { sportmonks } from '@/lib/sportmonks';
import { PredictionsList } from '@/components/predictions/PredictionsList';

export default async function PredictionsPage() {
  // Server-side data fetching - secure and fast
  const predictions = await sportmonks.getPredictions();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Match Predictions</h1>
      <PredictionsList predictions={predictions.data} />
    </div>
  );
}
```

### **2. Client Components for Interactivity**
```typescript
// app/components/predictions/PredictionFilters.tsx
'use client';
import { useState } from 'react';

interface Props {
  onFilterChange: (filters: FilterOptions) => void;
}

export function PredictionFilters({ onFilterChange }: Props) {
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);

  return (
    <div className="bg-white p-4 rounded-lg border mb-6">
      <h3 className="font-semibold mb-4">Filter Predictions</h3>
      {/* Interactive filter controls */}
    </div>
  );
}
```

### **3. API Routes with Error Handling**
```typescript
// app/api/sportmonks/predictions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';
import { SportMonksError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league');
    const date = searchParams.get('date');
    
    const predictions = await sportmonks.getPredictions({
      ...(league && { league }),
      ...(date && { date }),
    });
    
    return NextResponse.json({
      success: true,
      data: predictions,
      timestamp: new Date().toISOString(),
      meta: {
        count: predictions?.data?.length || 0,
        filters: { league, date },
      },
    });
  } catch (error) {
    console.error('Predictions API Error:', error);
    
    if (error instanceof SportMonksError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
```

### **4. Loading and Error States**
```typescript
// app/(dashboard)/predictions/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// app/(dashboard)/predictions/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto p-6 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Failed to load predictions
      </h2>
      <p className="text-gray-600 mb-6">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button 
        onClick={reset}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
```

### **5. Layouts for Consistent UI**
```typescript
// app/(dashboard)/layout.tsx
import { Navigation } from '@/components/ui/Navigation';
import { Header } from '@/components/ui/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## ⚡ **Performance Optimizations**

### **Data Fetching Strategies**
```typescript
// lib/sportmonks.ts - Enhanced with caching
import { unstable_cache } from 'next/cache';

export const getCachedPredictions = unstable_cache(
  async () => {
    return await sportmonks.getPredictions();
  },
  ['predictions'],
  {
    revalidate: 300, // 5 minutes
    tags: ['predictions', 'sportmonks'],
  }
);

export const getCachedLiveFixtures = unstable_cache(
  async () => {
    return await sportmonks.getLiveFixtures();
  },
  ['live-fixtures'],
  {
    revalidate: 60, // 1 minute for live data
    tags: ['live', 'fixtures', 'sportmonks'],
  }
);
```

### **Streaming with Suspense**
```typescript
// app/(dashboard)/predictions/page.tsx
import { Suspense } from 'react';
import { PredictionsList } from '@/components/predictions/PredictionsList';
import { ValueBetsList } from '@/components/value-bets/ValueBetsList';

export default function PredictionsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Match Predictions</h1>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<PredictionsLoading />}>
            <PredictionsList />
          </Suspense>
        </div>
        
        <div>
          <Suspense fallback={<ValueBetsLoading />}>
            <ValueBetsList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 **TypeScript Integration**

### **Complete Type Definitions**
```typescript
// lib/types.ts
export interface SportMonksResponse<T> {
  data: T[];
  pagination?: {
    count: number;
    per_page: number;
    current_page: number;
    next_page?: string;
    has_more: boolean;
  };
  subscription: Array<{
    meta: {
      trial_ends_at?: string;
      ends_at?: string;
    };
    plans: Array<{
      plan: string;
      sport: string;
    }>;
  }>;
  rate_limit: {
    resets_in_seconds: number;
    remaining: number;
    requested_entity: string;
  };
}

export interface Prediction {
  id: number;
  fixture_id: number;
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
  predictions: {
    correct_score?: string;
    both_teams_to_score?: boolean;
    over_under?: {
      over: number;
      under: number;
    };
  };
}

export interface ValueBet {
  id: number;
  fixture_id: number;
  market: string;
  selection: string;
  odds: number;
  probability: number;
  value: number;
  bookmaker: {
    id: number;
    name: string;
  };
}

export interface LiveFixture {
  id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  name: string;
  starting_at: string;
  state: {
    id: number;
    name: string;
    short_name: string;
  };
  participants: Array<{
    id: number;
    name: string;
    short_code: string;
    image_path: string;
    meta: {
      location: 'home' | 'away';
    };
  }>;
  scores?: Array<{
    participant_id: number;
    score: {
      goals: number;
    };
  }>;
}
```

---

## 🚀 **Development Workflow**

### **1. Start with MVP Pages**
```bash
# Create core pages first
app/(dashboard)/predictions/page.tsx
app/(dashboard)/live/page.tsx
app/(dashboard)/value-bets/page.tsx
```

### **2. Add API Routes**
```bash
# Create API endpoints
app/api/sportmonks/predictions/route.ts
app/api/sportmonks/value-bets/route.ts
app/api/sportmonks/fixtures/live/route.ts
```

### **3. Build Components**
```bash
# Create reusable components
app/components/predictions/PredictionCard.tsx
app/components/matches/LiveScore.tsx
app/components/value-bets/ValueBetCard.tsx
```

### **4. Add Error Handling**
```bash
# Create error boundaries
app/(dashboard)/predictions/error.tsx
app/(dashboard)/live/error.tsx
app/error.tsx
```

---

## 📊 **Monitoring & Analytics**

### **Performance Metrics**
```typescript
// lib/analytics.ts
export function trackPredictionView(predictionId: string) {
  // Track user interactions with predictions
}

export function trackAPIUsage(endpoint: string, responseTime: number) {
  // Monitor SportMonks API performance
}

export function trackUserEngagement(action: string, data?: any) {
  // Track user behavior for optimization
}
```

---

## 🎯 **Next Steps**

1. **Set up the basic App Router structure**
2. **Implement core API routes** for SportMonks integration
3. **Create essential components** (PredictionCard, LiveScore)
4. **Add loading and error states** for better UX
5. **Implement caching strategies** for performance
6. **Add TypeScript interfaces** for type safety

**Status**: 🏗️ **App Router architecture ready - optimized for SportMonks integration with modern Next.js patterns!**