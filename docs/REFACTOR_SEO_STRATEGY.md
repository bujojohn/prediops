# SEO-Optimized URL Strategy for Prediops

## Executive Summary
We will implement a **hybrid URL approach** using **Sportmonks API IDs + SEO-friendly slugs** to maximize search visibility while maintaining technical reliability.

## URL Pattern
```
/entity/[sportmonksApiId]/[seo-slug]
```

### Examples
- **Team**: `/team/85/manchester-united`
- **League**: `/league/8/premier-league`
- **Country**: `/country/462/england`
- **Fixture**: `/fixture/18535517/manchester-united-vs-liverpool`
- **Predictions**: `/predictions/league/8/premier-league`

## SEO Benefits

### 1. Keyword-Rich URLs
- ✅ Search engines index keywords from slugs
- ✅ "manchester-united" scores better than just "85"
- ✅ Improves relevance for branded searches

### 2. User Trust & Click-Through Rate
- ✅ Users more likely to click `/team/85/manchester-united` than `/team/85`
- ✅ Clear indication of page content before visiting
- ✅ Reduces bounce rate from wrong clicks

### 3. Social Media & Sharing
- ✅ URLs look professional on Twitter, Facebook, WhatsApp
- ✅ Slugs provide preview context
- ✅ Better for viral sharing and backlinks

### 4. Link Equity
- ✅ Anchor text from slugs helps search ranking
- ✅ Internal linking structure more meaningful
- ✅ Breadcrumbs more semantic

## Technical Implementation

### Slug Generation (Dynamic, No DB)
```typescript
// lib/utils/slug-utils.ts
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Remove duplicate hyphens
    .substring(0, 60);         // Max 60 chars for URLs
}

export function generateTeamSlug(team: Team): string {
  return team.name ? generateSlug(team.name) : `team-${team.id}`;
}

export function generateLeagueSlug(league: League): string {
  return league.name ? generateSlug(league.name) : `league-${league.id}`;
}

export function generateFixtureSlug(fixture: Fixture): string {
  const home = fixture.participants?.find(p => p.meta?.location === 'home')?.name;
  const away = fixture.participants?.find(p => p.meta?.location === 'away')?.name;
  
  if (home && away) {
    return generateSlug(`${home}-vs-${away}`);
  }
  
  return `fixture-${fixture.id}`;
}
```

### Route Structure (Next.js App Router)
```
app/
  team/
    [teamId]/
      [slug]/
        page.tsx           ← /team/85/manchester-united
  league/
    [leagueId]/
      [slug]/
        page.tsx           ← /league/8/premier-league
  country/
    [countryId]/
      [slug]/
        page.tsx           ← /country/462/england
  fixture/
    [fixtureId]/
      [slug]/
        page.tsx           ← /fixture/18535517/man-utd-vs-liverpool
  predictions/
    league/
      [leagueId]/
        [slug]/
          page.tsx         ← /predictions/league/8/premier-league
    country/
      [countryId]/
        [slug]/
          page.tsx         ← /predictions/country/462/england
```

### Page Handler Logic
```typescript
// app/team/[teamId]/[slug]/page.tsx
export default async function TeamPage({ params }: Props) {
  const { teamId, slug } = await params;
  
  // 1. Fetch data using Sportmonks API ID
  const team = await sportmonks.getTeam(teamId);
  
  // 2. Generate canonical slug
  const canonicalSlug = generateTeamSlug(team);
  
  // 3. If slug is wrong or missing, redirect to canonical URL
  if (slug !== canonicalSlug) {
    redirect(`/team/${teamId}/${canonicalSlug}`);
  }
  
  // 4. Render page
  return <TeamDetailClient team={team} />;
}
```

### Backward Compatibility
```typescript
// Support old URLs without breaking existing links
// app/team/[teamId]/page.tsx (optional slug)
export default async function TeamPageLegacy({ params }: Props) {
  const { teamId } = await params;
  
  // Fetch team to get name for slug
  const team = await sportmonks.getTeam(teamId);
  const slug = generateTeamSlug(team);
  
  // Redirect to canonical URL with slug
  redirect(`/team/${teamId}/${slug}`);
}
```

## SEO Meta Tags

### Canonical URLs
```typescript
// Always set canonical URL to prevent duplicate content
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { teamId, slug } = await params;
  const team = await sportmonks.getTeam(teamId);
  const canonicalSlug = generateTeamSlug(team);
  
  return {
    title: `${team.name} - Stats, Fixtures & Predictions`,
    description: `Complete ${team.name} statistics, upcoming fixtures, and predictions`,
    alternates: {
      canonical: `https://prediops.com/team/${teamId}/${canonicalSlug}`
    },
    openGraph: {
      url: `https://prediops.com/team/${teamId}/${canonicalSlug}`,
      title: team.name,
      images: [team.image_path]
    }
  };
}
```

### Structured Data (JSON-LD)
```typescript
// Add schema.org markup for rich snippets
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  "name": team.name,
  "url": `https://prediops.com/team/${teamId}/${slug}`,
  "logo": team.image_path,
  "sport": "Soccer",
  "memberOf": {
    "@type": "SportsOrganization",
    "name": league.name
  }
};
```

## Link Generation (Centralized)

### Updated routing.ts
```typescript
// lib/utils/routing.ts
export const ROUTES = {
  TEAM: (teamId: string | number, slug: string) => 
    `/team/${teamId}/${slug}`,
  
  LEAGUE: (leagueId: string | number, slug: string) => 
    `/league/${leagueId}/${slug}`,
  
  COUNTRY: (countryId: string | number, slug: string) => 
    `/country/${countryId}/${slug}`,
  
  FIXTURE: (fixtureId: string | number, slug: string) => 
    `/fixture/${fixtureId}/${slug}`,
  
  PREDICTIONS_LEAGUE: (leagueId: string | number, slug: string) => 
    `/predictions/league/${leagueId}/${slug}`,
  
  PREDICTIONS_COUNTRY: (countryId: string | number, slug: string) => 
    `/predictions/country/${countryId}/${slug}`,
} as const;

// Helper functions with auto-slug generation
export function generateTeamUrl(team: Team | Participant): string {
  const slug = generateTeamSlug(team);
  return ROUTES.TEAM(team.id, slug);
}

export function generateLeagueUrl(league: League): string {
  const slug = generateLeagueSlug(league);
  return ROUTES.LEAGUE(league.id, slug);
}
```

## Migration Strategy

### Phase 1: Create New Routes (Non-Breaking)
- Create new `/team/[teamId]/[slug]/` routes alongside existing
- All new links use new format
- Old routes still work

### Phase 2: Add Redirects (SEO Preservation)
- Old URLs redirect to new format with 301 (permanent)
- Search engines transfer ranking signals
- User bookmarks continue to work

### Phase 3: Update Internal Links
- Replace all internal links to use new routing helpers
- Update sitemap.xml
- Update robots.txt if needed

### Phase 4: Monitor & Optimize
- Track 404s and add redirects as needed
- Monitor Google Search Console for crawl errors
- Update social media previews

## Performance Considerations

### 1. Slug Generation Performance
- Slugs generated once per request (cheap operation)
- Can add memoization if needed
- No database queries required

### 2. Redirect Performance
- Single redirect per wrong slug (minimal overhead)
- Browsers cache 301 redirects
- CDN can cache canonical URLs

### 3. Build-Time Optimization
```typescript
// Generate static params for popular entities
export async function generateStaticParams() {
  const topTeams = await getTopTeams(100);
  
  return topTeams.map(team => ({
    teamId: team.id.toString(),
    slug: generateTeamSlug(team)
  }));
}
```

## Benefits Summary

| Aspect | Without Slugs | With Slugs (Hybrid) |
|--------|--------------|---------------------|
| SEO Score | 6/10 | 9/10 |
| User Trust | Medium | High |
| Social Sharing | Poor | Excellent |
| Implementation | Simple | Moderate |
| Maintenance | Easy | Easy |
| Performance | Fast | Fast |
| Reliability | Good | Excellent |

## Recommendation

**✅ Implement hybrid approach with API IDs + slugs**

This gives us:
1. **Best SEO** - Keywords in URLs, human-readable
2. **Reliability** - ID-based routing never breaks
3. **Simplicity** - No database slugs, generated dynamically
4. **Compatibility** - Easy to migrate from current state
5. **Performance** - No extra database queries

## Next Steps

1. ✅ Approve this SEO strategy
2. Create slug utility functions
3. Update route structure
4. Implement link components
5. Add canonical meta tags
6. Set up redirects
7. Update documentation
8. Deploy and monitor

