# Final URL Strategy - Implementation Guide

**Status:** ✅ APPROVED - Ready for Implementation  
**Date:** October 11, 2025  
**Strategy:** Hybrid URLs using Sportmonks API IDs + SEO-friendly slugs

## Executive Summary

We will standardize all entity URLs to use the **hybrid pattern**: `/entity/[sportmonksApiId]/[slug]`

This approach provides:
- ✅ **SEO optimization** - Keywords in URLs for better search rankings
- ✅ **Technical reliability** - API IDs ensure pages always load correctly
- ✅ **No database changes** - Slugs generated dynamically from entity names
- ✅ **Backward compatibility** - Easy migration from current mixed patterns

## URL Patterns

### Teams
```
Current: /team/85/manchester-united ✅ Already correct!
Keep as-is, just ensure consistency across all team pages
```

### Leagues
```
Current: /league/8 (no slug)
        /predictions/league/premier-league?id=8 (mixed)

New:     /league/8/premier-league
         /predictions/league/8/premier-league
```

### Countries
```
Current: /country/462 (no slug)
         /predictions/country/england?id=462 (mixed)

New:     /country/462/england
         /predictions/country/462/england
```

### Fixtures
```
Current: /fixtures/18535517 (no slug)

New:     /fixture/18535517/manchester-united-vs-liverpool
```

## Key Implementation Details

### 1. Use Sportmonks API IDs (Not Database IDs)
```typescript
// ✅ Correct - Use Sportmonks ID
const teamId = team.id; // From Sportmonks API
const url = `/team/${teamId}/manchester-united`;

// ❌ Wrong - Don't use database auto-increment ID
const dbId = teamRecord.id; // From your database
const url = `/team/${dbId}/manchester-united`;
```

**Why?** Direct mapping to Sportmonks API, no extra database lookups needed.

### 2. Dynamic Slug Generation
```typescript
// No database slug columns needed
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

// Example
generateSlug("Manchester United F.C.") → "manchester-united-fc"
```

### 3. Slug is Optional but Redirected
```typescript
// Both URLs work:
/team/85                    → 301 redirect → /team/85/manchester-united
/team/85/manchester-united  → 200 OK (canonical)

// Wrong slug gets corrected:
/team/85/man-utd           → 301 redirect → /team/85/manchester-united
```

### 4. Route Structure
```
app/
  team/
    [teamId]/
      page.tsx                    ← Legacy: /team/85 (redirects)
      [slug]/
        page.tsx                  ← New: /team/85/manchester-united
  
  league/
    [leagueId]/
      page.tsx                    ← Legacy: /league/8 (redirects)
      [slug]/
        page.tsx                  ← New: /league/8/premier-league
  
  country/
    [countryId]/
      page.tsx                    ← Legacy: /country/462 (redirects)
      [slug]/
        page.tsx                  ← New: /country/462/england
  
  fixture/
    [fixtureId]/
      page.tsx                    ← Legacy: /fixture/18535517 (redirects)
      [slug]/
        page.tsx                  ← New: /fixture/18535517/man-utd-vs-liverpool
  
  predictions/
    league/
      [leagueId]/
        [slug]/
          page.tsx                ← /predictions/league/8/premier-league
    
    country/
      [countryId]/
        [slug]/
          page.tsx                ← /predictions/country/462/england
```

## Implementation Checklist

- [ ] Create `lib/utils/slug-utils.ts` with slug generation functions
- [ ] Update `lib/utils/routing.ts` to use new patterns
- [ ] Create league routes: `app/league/[leagueId]/[slug]/page.tsx`
- [ ] Create country routes: `app/country/[countryId]/[slug]/page.tsx`
- [ ] Create fixture routes: `app/fixture/[fixtureId]/[slug]/page.tsx`
- [ ] Update predictions/league routes
- [ ] Update predictions/country routes
- [ ] Create `LeagueLink`, `CountryLink`, `FixtureLink` components
- [ ] Update all search results to use new URLs
- [ ] Update sidebar navigation links
- [ ] Add canonical URL meta tags to all pages
- [ ] Add 301 redirects from old URLs
- [ ] Test all routes work correctly
- [ ] Update sitemap generation
- [ ] Update README with new URL patterns

## Migration Strategy

### Phase 1: Create New Routes (Current)
- Add new slug-based routes alongside existing
- Keep old routes functional
- No breaking changes

### Phase 2: Update Links
- Update all link components to use new format
- Search results return new URLs
- Internal navigation uses new patterns

### Phase 3: Add Redirects
- Old URLs → 301 redirect → New URLs
- Preserve SEO ranking
- Update Google Search Console

### Phase 4: Cleanup
- Monitor for 404s
- Remove legacy route handlers after validation
- Update external documentation

## Example Implementations

### Page Handler with Slug Validation
```typescript
// app/league/[leagueId]/[slug]/page.tsx
export default async function LeaguePage({ params }: Props) {
  const { leagueId, slug } = await params;
  
  // Fetch using Sportmonks API ID
  const league = await sportmonks.getLeague(leagueId);
  
  // Generate canonical slug
  const canonicalSlug = generateLeagueSlug(league);
  
  // Redirect if slug is wrong
  if (slug !== canonicalSlug) {
    redirect(`/league/${leagueId}/${canonicalSlug}`);
  }
  
  return <LeagueDetailClient league={league} />;
}
```

### Metadata with Canonical URL
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leagueId, slug } = await params;
  const league = await sportmonks.getLeague(leagueId);
  const canonicalSlug = generateLeagueSlug(league);
  
  return {
    title: `${league.name} - Fixtures, Standings & Predictions`,
    alternates: {
      canonical: `https://prediops.com/league/${leagueId}/${canonicalSlug}`
    }
  };
}
```

### Link Component
```typescript
// components/ui/LeagueLink.tsx
export function LeagueLink({ league, children }: Props) {
  const url = generateLeagueUrl(league); // /league/8/premier-league
  
  return (
    <Link href={url} className="hover:underline">
      {children || league.name}
    </Link>
  );
}
```

## SEO Benefits

1. **Better Rankings** - Keywords like "premier-league" in URL help Google
2. **Higher CTR** - Users trust readable URLs (40% improvement)
3. **Social Sharing** - Professional URLs on social media
4. **Link Equity** - Slugs provide natural anchor text
5. **Rich Snippets** - Better structured data support

## Performance

- **Slug Generation:** ~0.1ms per entity (negligible)
- **Redirects:** Cached by browsers (one-time cost)
- **API Calls:** No change - still use Sportmonks API IDs directly
- **Database:** No extra queries - slugs from entity names

## References

- See `docs/REFACTOR_SEO_STRATEGY.md` for detailed SEO implementation
- See `docs/URL_STRATEGY_WITH_IDS.md` for technical deep-dive
- See `docs/REFACTOR_URL_STRATEGY_PLAN.md` for implementation plan

