# URL Strategy with ID Handling - Best Practices

## The Challenge

You're correct that IDs are critical for accurate data fetching. The challenge is maintaining clean URLs while ensuring we can still access the correct data. Here are several proven approaches:

## Solution 1: Slug-to-ID Mapping (Recommended)

### 1. Database/Storage Strategy

```typescript
// Store slug mappings in database or cache
interface SlugMapping {
  slug: string;
  id: number;
  type: 'team' | 'country' | 'league' | 'fixture';
  lastUpdated: Date;
}

// Example mappings
const slugMappings = {
  teams: {
    'manchester-united': { id: 1, name: 'Manchester United FC' },
    'liverpool-fc': { id: 2, name: 'Liverpool FC' },
    'arsenal-fc': { id: 3, name: 'Arsenal FC' },
  },
  countries: {
    'england': { id: 42, name: 'England' },
    'spain': { id: 143, name: 'Spain' },
    'germany': { id: 156, name: 'Germany' },
  },
  leagues: {
    'premier-league': { id: 8, name: 'Premier League' },
    'champions-league': { id: 162, name: 'UEFA Champions League' },
    'serie-a': { id: 384, name: 'Serie A' },
  }
};
```

### 2. Server-Side Slug Resolution

```typescript
// app/teams/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getTeamBySlug, getTeamById } from '@/lib/data/teams';

interface TeamPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  
  try {
    // Resolve slug to ID
    const teamId = await getTeamIdBySlug(slug);
    
    if (!teamId) {
      notFound();
    }
    
    // Fetch team data using ID
    const team = await getTeamById(teamId);
    
    if (!team) {
      notFound();
    }
    
    // Verify slug is still correct (handle slug changes)
    const currentSlug = generateTeamSlug(team);
    if (currentSlug !== slug) {
      // Redirect to correct slug
      redirect(`/teams/${currentSlug}`, { status: 301 });
    }
    
    return <TeamClient team={team} />;
  } catch (error) {
    notFound();
  }
}

// lib/data/teams.ts
export async function getTeamIdBySlug(slug: string): Promise<number | null> {
  // Check cache first
  const cached = await getCachedSlugMapping('team', slug);
  if (cached) {
    return cached.id;
  }
  
  // Query database
  const team = await db.team.findFirst({
    where: { slug },
    select: { id: true }
  });
  
  if (team) {
    // Cache the mapping
    await cacheSlugMapping('team', slug, team.id);
    return team.id;
  }
  
  return null;
}

export async function getTeamById(id: number) {
  return await db.team.findUnique({
    where: { id },
    include: {
      country: true,
      venue: true,
      // ... other relations
    }
  });
}
```

### 3. Client-Side Data Fetching

```typescript
// hooks/useTeamData.ts
export function useTeamData(slug: string) {
  return useQuery({
    queryKey: ['team', slug],
    queryFn: async () => {
      // API automatically resolves slug to ID
      const response = await fetch(`/api/teams/${slug}`);
      if (!response.ok) {
        throw new Error('Team not found');
      }
      return response.json();
    },
    enabled: !!slug,
  });
}

// app/api/teams/[slug]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    // Resolve slug to ID
    const teamId = await getTeamIdBySlug(slug);
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    // Fetch team data using ID
    const team = await getTeamById(teamId);
    
    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Solution 2: Hybrid Approach (ID + Slug)

### URL Structure with Both ID and Slug

```typescript
// URLs include both ID and slug for reliability
/teams/1/manchester-united
/countries/42/england
/leagues/8/premier-league
/fixtures/12345/manchester-united-vs-liverpool-2024-01-15 (Note: date for this structure is not necessary)

// But display only the slug in browser
// The ID ensures accurate data fetching
```

### Implementation

```typescript
// app/teams/[id]/[slug]/page.tsx
export default async function TeamPage({ 
  params 
}: { 
  params: Promise<{ id: string; slug: string }> 
}) {
  const { id, slug } = await params;
  
  try {
    // Use ID for data fetching (guaranteed accuracy)
    const team = await getTeamById(parseInt(id));
    
    if (!team) {
      notFound();
    }
    
    // Verify slug is correct
    const currentSlug = generateTeamSlug(team);
    if (currentSlug !== slug) {
      // Redirect to correct slug
      redirect(`/teams/${id}/${currentSlug}`, { status: 301 });
    }
    
    return <TeamClient team={team} />;
  } catch (error) {
    notFound();
  }
}
```

## Solution 3: API-First Approach

### Clean URLs with API Resolution

```typescript
// URLs remain clean
/teams/manchester-united
/countries/england
/leagues/premier-league

// But API endpoints handle ID resolution
// app/api/teams/[slug]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  // Resolve slug to ID internally
  const teamId = await resolveSlugToId('team', slug);
  
  if (!teamId) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }
  
  // Fetch data using ID
  const team = await fetchTeamData(teamId);
  
  return NextResponse.json(team);
}

// Utility function for slug resolution
async function resolveSlugToId(type: string, slug: string): Promise<number | null> {
  // Check cache first
  const cacheKey = `${type}:${slug}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return parseInt(cached);
  }
  
  // Query database
  let id: number | null = null;
  
  switch (type) {
    case 'team':
      const team = await db.team.findFirst({ where: { slug }, select: { id: true } });
      id = team?.id || null;
      break;
    case 'country':
      const country = await db.country.findFirst({ where: { slug }, select: { id: true } });
      id = country?.id || null;
      break;
    case 'league':
      const league = await db.league.findFirst({ where: { slug }, select: { id: true } });
      id = league?.id || null;
      break;
  }
  
  if (id) {
    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, id.toString());
  }
  
  return id;
}
```

## Solution 4: Database Schema with Slugs

### Add Slug Fields to Database

```sql
-- Add slug columns to existing tables
ALTER TABLE teams ADD COLUMN slug VARCHAR(255) UNIQUE;
ALTER TABLE countries ADD COLUMN slug VARCHAR(255) UNIQUE;
ALTER TABLE leagues ADD COLUMN slug VARCHAR(255) UNIQUE;
ALTER TABLE fixtures ADD COLUMN slug VARCHAR(255) UNIQUE;

-- Create indexes for performance
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_countries_slug ON countries(slug);
CREATE INDEX idx_leagues_slug ON leagues(slug);
CREATE INDEX idx_fixtures_slug ON fixtures(slug);

-- Populate slugs for existing data
UPDATE teams SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), 'FC', '')) WHERE slug IS NULL;
UPDATE countries SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
UPDATE leagues SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), 'UEFA ', '')) WHERE slug IS NULL;
```

### Prisma Schema Update

```prisma
model Team {
  id       Int     @id @default(autoincrement())
  name     String
  slug     String  @unique
  // ... other fields
  
  @@map("teams")
}

model Country {
  id       Int     @id @default(autoincrement())
  name     String
  slug     String  @unique
  // ... other fields
  
  @@map("countries")
}

model League {
  id       Int     @id @default(autoincrement())
  name     String
  slug     String  @unique
  // ... other fields
  
  @@map("leagues")
}
```

## Solution 5: Caching Strategy

### Redis-Based Slug Cache

```typescript
// lib/cache/slug-cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class SlugCache {
  private static TTL = 3600; // 1 hour
  
  static async get(type: string, slug: string): Promise<number | null> {
    const key = `slug:${type}:${slug}`;
    const id = await redis.get(key);
    return id ? parseInt(id) : null;
  }
  
  static async set(type: string, slug: string, id: number): Promise<void> {
    const key = `slug:${type}:${slug}`;
    await redis.setex(key, this.TTL, id.toString());
  }
  
  static async invalidate(type: string, slug: string): Promise<void> {
    const key = `slug:${type}:${slug}`;
    await redis.del(key);
  }
  
  static async invalidateAll(type: string, id: number): Promise<void> {
    // Invalidate all slugs for this entity
    const pattern = `slug:${type}:*`;
    const keys = await redis.keys(pattern);
    
    for (const key of keys) {
      const value = await redis.get(key);
      if (value === id.toString()) {
        await redis.del(key);
      }
    }
  }
}

// Usage in API routes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  // Check cache first
  let teamId = await SlugCache.get('team', slug);
  
  if (!teamId) {
    // Resolve from database
    const team = await db.team.findFirst({
      where: { slug },
      select: { id: true }
    });
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    teamId = team.id;
    
    // Cache the result
    await SlugCache.set('team', slug, teamId);
  }
  
  // Fetch team data using ID
  const team = await getTeamById(teamId);
  
  return NextResponse.json(team);
}
```

## Recommended Implementation Strategy

### Phase 1: Hybrid Approach (Immediate)
```typescript
// Use both ID and slug in URLs for reliability
/teams/1/manchester-united
/countries/42/england
/leagues/8/premier-league
```

### Phase 2: Database Schema Update
```sql
-- Add slug columns to existing tables
-- Populate slugs for existing data
-- Create indexes for performance
```

### Phase 3: Slug-Only URLs
```typescript
// Transition to clean slug-only URLs
/teams/manchester-united
/countries/england
/leagues/premier-league
```

### Phase 4: Advanced Caching
```typescript
// Implement Redis-based slug caching
// Add slug invalidation on data updates
// Monitor cache performance
```

## Benefits of This Approach

### 1. **Data Accuracy**
- ✅ IDs ensure correct data fetching
- ✅ Slugs provide clean URLs
- ✅ Fallback mechanisms for slug changes

### 2. **Performance**
- ✅ Caching reduces database queries
- ✅ Indexed slug lookups are fast
- ✅ Redis provides sub-millisecond access

### 3. **SEO Benefits**
- ✅ Clean, descriptive URLs
- ✅ Consistent URL patterns
- ✅ Proper redirects for slug changes

### 4. **Maintainability**
- ✅ Centralized slug resolution
- ✅ Easy to update slugs
- ✅ Clear error handling

## Example Implementation

```typescript
// Complete example for team pages
// app/teams/[slug]/page.tsx
export default async function TeamPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  try {
    // Resolve slug to ID with caching
    const teamId = await resolveTeamSlugToId(slug);
    
    if (!teamId) {
      notFound();
    }
    
    // Fetch team data using ID
    const team = await getTeamById(teamId);
    
    if (!team) {
      notFound();
    }
    
    // Verify slug is still correct
    const currentSlug = generateTeamSlug(team);
    if (currentSlug !== slug) {
      redirect(`/teams/${currentSlug}`, { status: 301 });
    }
    
    return <TeamClient team={team} />;
  } catch (error) {
    notFound();
  }
}

// lib/data/teams.ts
export async function resolveTeamSlugToId(slug: string): Promise<number | null> {
  // Check cache first
  const cached = await SlugCache.get('team', slug);
  if (cached) {
    return cached;
  }
  
  // Query database
  const team = await db.team.findFirst({
    where: { slug },
    select: { id: true }
  });
  
  if (team) {
    // Cache the result
    await SlugCache.set('team', slug, team.id);
    return team.id;
  }
  
  return null;
}
```

This approach gives you the best of both worlds: clean, SEO-friendly URLs and accurate data fetching using IDs. The key is implementing proper slug-to-ID resolution with caching for performance.
