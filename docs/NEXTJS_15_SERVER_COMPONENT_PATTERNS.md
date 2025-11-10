# Next.js 15 App Router Server Component Patterns

This document outlines the **Next.js 15 App Router server component patterns** implemented in the PrediOps project, based on real codebase examples and best practices.

---

## 🔑 Key Next.js 15 Changes

### **1. `searchParams` is Now a Promise**

In Next.js 15, `searchParams` prop in page components is now a **Promise** that must be awaited:

```typescript
// ✅ Next.js 15 - searchParams is a Promise
interface PageProps {
  searchParams: Promise<{ date?: string; page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const date = params.date || new Date().toISOString().split('T')[0];
  // ...
}
```

**Before (Next.js 14):**
```typescript
// ❌ Next.js 14 - searchParams was an object
export default function Page({ searchParams }: { searchParams: { date?: string } }) {
  const date = searchParams.date;
}
```

---

## 📋 Pattern 1: Basic Async Server Component

**File:** `app/live/page.tsx`

```typescript
import { sportmonks } from '@/lib/sportmonks';
import type { Fixture } from '@/schemas/fixture.schema';
import { LiveFixturesClient } from './components/LiveFixturesClient';

export default async function LiveMatchesPage() {
  try {
    // Server-side data fetching
    const liveFixturesResponse = await sportmonks.getLiveFixtures({
      include: 'participants;scores;state;predictions.type;league.country',
      sortBy: 'starting_at',
      order: 'desc',
      per_page: 50,
      page: 1
    });
    
    const liveFixtures: Fixture[] = liveFixturesResponse?.data || [];

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Live Matches</h1>
        <LiveFixturesClient initialFixtures={liveFixtures} />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch live fixtures:', error);
    
    // Return error state (not throw)
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Live Matches</h1>
        <div className="text-red-600">
          Failed to load live matches. Please try again later.
        </div>
      </div>
    );
  }
}
```

**Key Points:**
- ✅ Server component by default (no `'use client'`)
- ✅ Direct async/await data fetching
- ✅ Error handling with graceful fallback UI
- ✅ TypeScript typing for API responses

---

## 📋 Pattern 2: Server Component with `searchParams` (Next.js 15)

**File:** `app/predictions/page.tsx`

```typescript
import { Suspense } from 'react';
import { PredictionsContentWithQuery } from './components/PredictionsContentWithQuery';
import { PredictionsSkeleton } from './components/PredictionsSkeleton';
import { sportmonks } from '@/lib/sportmonks';

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  // ✅ Await searchParams in Next.js 15
  const resolvedSearchParams = await searchParams;
  const selectedDate = resolvedSearchParams.date || new Date().toISOString().split('T')[0];
  
  // Validate and sanitize input
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);
  const dateToLoad = isValidDate ? selectedDate : new Date().toISOString().split('T')[0];

  // Server-side data fetching with error handling
  let initialFixtures = [];
  try {
    const fixturesResponse = await sportmonks.getFixturesByDate(dateToLoad, {
      include: 'participants;scores;state;predictions.type;league.country;events',
      per_page: 50,
      page: 1,
    });
    initialFixtures = fixturesResponse?.data || [];
  } catch (error) {
    console.error('Error loading initial fixtures:', error);
    // Continue without initial fixtures - client will handle loading
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Suspense for progressive loading */}
      <Suspense fallback={<PredictionsSkeleton />}>
        <PredictionsContentWithQuery 
          initialFixtures={initialFixtures}
          initialDate={dateToLoad}
        />
      </Suspense>
    </div>
  );
}
```

**Key Points:**
- ✅ `searchParams` is awaited as a Promise
- ✅ Input validation and sanitization
- ✅ Try-catch for graceful error handling
- ✅ Suspense boundaries for progressive loading
- ✅ Initial data passed to client components

---

## 📋 Pattern 3: Complex `searchParams` with Multiple Filters

**File:** `app/teams/page.tsx`

```typescript
import { Suspense } from 'react';
import { sportmonks } from '@/lib/sportmonks';
import { TeamsClient } from './teams-client';

interface TeamsPageProps {
  searchParams: Promise<{
    search?: string;
    country?: string;
    league?: string;
    founded?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  }>;
}

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  // ✅ Await searchParams
  const params = await searchParams;
  
  // Build API config from search params
  const config = {
    include: 'country',
    select: 'name,short_code,image_path,founded,type',
    filters: {
      ...(params.country && { countries: params.country }),
      ...(params.league && { leagues: params.league }),
      ...(params.founded && { founded: params.founded }),
    },
    order: params.sortOrder || 'asc',
    per_page: 24,
    page: params.page ? parseInt(params.page) : 1,
  };

  try {
    // Fetch teams data
    const teamsResponse = await sportmonks.getTeams(config);
    
    // Validate response data with Zod schemas
    const teams = teamsResponse.data?.map((team: Team) => {
      try {
        return TeamSchema.parse(team);
      } catch (error) {
        console.error('Schema validation failed for team:', team.id);
        return null;
      }
    }).filter((team): team is NonNullable<typeof team> => team !== null) || [];

    return (
      <div className="container mx-auto px-4 py-6">
        <Suspense fallback={
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            {/* Skeleton UI */}
          </div>
        }>
          <TeamsClient 
            initialTeams={teams}
            initialPagination={{
              current_page: Number(teamsResponse.pagination?.current_page) || 1,
              last_page: teamsResponse.pagination?.has_more ? 
                Number(teamsResponse.pagination?.current_page) + 1 : 
                Number(teamsResponse.pagination?.current_page) || 1,
              per_page: Number(teamsResponse.pagination?.per_page) || 24,
              total: Number(teamsResponse.pagination?.count) || teams.length,
            }}
            initialSearchParams={params}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error fetching teams:', error);
    
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">
            Unable to load teams at this time. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
```

**Key Points:**
- ✅ Complex search params with multiple optional filters
- ✅ Config building from URL parameters
- ✅ Data validation with Zod schemas
- ✅ Pagination handling
- ✅ Suspense with custom skeleton UI

---

## 📋 Pattern 4: Dynamic Routes with `params`

**File:** `app/team/[teamId]/[slug]/page.tsx` (example pattern)

```typescript
interface TeamDetailPageProps {
  params: Promise<{
    teamId: string;
    slug: string;
  }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  // ✅ params is also a Promise in Next.js 15
  const { teamId, slug } = await params;
  
  // Fetch team data
  const team = await sportmonks.getTeamById(parseInt(teamId));
  
  return (
    <div>
      <h1>{team.name}</h1>
      {/* Team details */}
    </div>
  );
}
```

**Key Points:**
- ✅ `params` is also a Promise in Next.js 15
- ✅ Type-safe params with TypeScript
- ✅ Server-side data fetching per route

---

## 📋 Pattern 5: Metadata Export Pattern

**File:** `app/countries/page.tsx`

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Countries - Prediops',
  description: 'Browse football leagues and competitions by country.',
};

export default function CountriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page content */}
    </div>
  );
}
```

**Key Points:**
- ✅ Static metadata export
- ✅ SEO optimization
- ✅ Can also use `generateMetadata` for dynamic metadata

---

## 📋 Pattern 6: API Route Handlers

**File:** `app/api/search/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const scope = searchParams.get('scope') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters',
      }, { status: 400 });
    }

    // Parallel search operations
    const searchPromises = [];
    
    if (scope === 'all' || scope === 'countries') {
      searchPromises.push(searchCountries(query, limit));
    }
    
    // ... more searches

    const results = await Promise.allSettled(searchPromises);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
```

**Key Points:**
- ✅ `NextRequest` and `NextResponse` for type safety
- ✅ URL search params parsing
- ✅ Parallel promise execution with `Promise.allSettled`
- ✅ Proper HTTP status codes
- ✅ Input validation

---

## 🎯 Best Practices Summary

### **1. Always Await `searchParams` and `params`**
```typescript
// ✅ Next.js 15
const params = await searchParams;
const { id } = await params;
```

### **2. Input Validation**
```typescript
const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);
const dateToLoad = isValidDate ? selectedDate : defaultDate;
```

### **3. Error Handling**
```typescript
try {
  const data = await fetchData();
  return <Component data={data} />;
} catch (error) {
  console.error('Error:', error);
  return <ErrorState />; // Don't throw, return UI
}
```

### **4. Suspense Boundaries**
```typescript
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

### **5. Type Safety**
```typescript
interface PageProps {
  searchParams: Promise<{ date?: string }>;
  params: Promise<{ id: string }>;
}
```

### **6. Server/Client Separation**
- **Server Components**: Data fetching, heavy computations
- **Client Components**: Interactivity, state management, browser APIs

### **7. Data Validation**
```typescript
const teams = response.data?.map(team => {
  try {
    return TeamSchema.parse(team); // Zod validation
  } catch {
    return null;
  }
}).filter(Boolean);
```

---

## 📚 Additional Resources

- [Next.js 15 App Router Documentation](https://nextjs.org/docs/app)
- [Server Components Guide](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Data Fetching Patterns](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

## 🔄 Migration from Next.js 14 to 15

### **Before (Next.js 14):**
```typescript
export default function Page({ searchParams }: { searchParams: { date?: string } }) {
  const date = searchParams.date;
}
```

### **After (Next.js 15):**
```typescript
export default async function Page({ 
  searchParams 
}: { 
  searchParams: Promise<{ date?: string }> 
}) {
  const params = await searchParams;
  const date = params.date;
}
```

---

This document reflects the actual patterns used in the PrediOps codebase and follows Next.js 15 best practices.
