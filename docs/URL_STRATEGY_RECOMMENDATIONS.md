# URL Strategy Best Practices - Recommendations

## Current Issues

### 1. Inconsistent Patterns
- **Teams**: `/team/{id}/{slug}` ✅ Good
- **Countries**: `/country/{id}` ❌ Should be `/country/{slug}`
- **Leagues**: `/league/{id}` ❌ Should be `/league/{slug}`
- **Predictions**: Using query params ❌ Should be path-based

### 2. Query Parameter Dependencies
```typescript
// Current (problematic)
/predictions/country/england?id=42
/predictions/league/premier-league?id=8

// Recommended
/predictions/country/england
/predictions/league/premier-league
```

### 3. Mixed ID/Slug Usage
- Some routes use IDs, others use slugs
- Creates confusion and inconsistent behavior

## Recommended URL Strategy

### 1. Consistent Slug-Only URLs
```typescript
// All entities should use slugs only
/teams/manchester-united
/countries/england  
/leagues/premier-league
/fixtures/12345-manchester-united-vs-liverpool

// Predictions follow same pattern
/predictions/teams/manchester-united
/predictions/countries/england
/predictions/leagues/premier-league
```

### 2. Hierarchical Structure
```typescript
// Clear hierarchy
/predictions/
├── /predictions/teams/{slug}
├── /predictions/countries/{slug}  
├── /predictions/leagues/{slug}
└── /predictions/fixtures/{slug}

// Entity details
/teams/{slug}
/countries/{slug}
/leagues/{slug}
/fixtures/{slug}
```

### 3. SEO-Friendly Fixture URLs
```typescript
// Instead of just IDs, use descriptive URLs
/fixtures/12345-manchester-united-vs-liverpool
/fixtures/12345-2024-01-15-manchester-united-liverpool
```

### 4. Tab Navigation via Hash
```typescript
// Use hash for tabs (client-side navigation)
/teams/manchester-united#fixtures
/teams/manchester-united#predictions
/teams/manchester-united#statistics
```

## Implementation Plan

### Phase 1: Standardize Entity URLs
1. Update country routes to use slugs
2. Update league routes to use slugs  
3. Implement proper slug generation

### Phase 2: Remove Query Parameters
1. Update predictions routes to be path-based
2. Remove `?id=` dependencies
3. Add proper redirects for old URLs

### Phase 3: Enhanced Fixture URLs
1. Implement descriptive fixture URLs
2. Add fixture slug generation
3. Update all fixture links

### Phase 4: Canonical URL Strategy
1. Implement slug change handling
2. Add proper redirects
3. Canonical URL meta tags

## Benefits

### SEO Benefits
- ✅ Clean, descriptive URLs
- ✅ No query parameters in main URLs
- ✅ Consistent URL patterns
- ✅ Better crawling and indexing

### User Experience
- ✅ Shareable URLs
- ✅ Bookmarkable pages
- ✅ Clear URL structure
- ✅ Predictable navigation

### Developer Experience
- ✅ Consistent patterns
- ✅ Easier maintenance
- ✅ Better testing
- ✅ Clear routing logic

## Migration Strategy

### 1. Backward Compatibility
```typescript
// Keep old routes working with redirects
/country/42 → /countries/england
/league/8 → /leagues/premier-league
/predictions/country/england?id=42 → /predictions/countries/england
```

### 2. Gradual Rollout
- Phase 1: Update new URLs
- Phase 2: Add redirects for old URLs
- Phase 3: Update all internal links
- Phase 4: Remove old route handlers

### 3. Monitoring
- Track redirect usage
- Monitor 404 errors
- SEO impact analysis
- User behavior tracking

## Code Examples

### Updated Routing Utilities
```typescript
export const ROUTES = {
  // Entity routes (slug-only)
  TEAM_DETAIL: (slug: string) => `/teams/${slug}`,
  COUNTRY_DETAIL: (slug: string) => `/countries/${slug}`,
  LEAGUE_DETAIL: (slug: string) => `/leagues/${slug}`,
  FIXTURE_DETAIL: (slug: string) => `/fixtures/${slug}`,
  
  // Prediction routes (path-based)
  TEAM_PREDICTIONS: (slug: string) => `/predictions/teams/${slug}`,
  COUNTRY_PREDICTIONS: (slug: string) => `/predictions/countries/${slug}`,
  LEAGUE_PREDICTIONS: (slug: string) => `/predictions/leagues/${slug}`,
  
  // Tab navigation (hash-based)
  TEAM_FIXTURES: (slug: string) => `/teams/${slug}#fixtures`,
  TEAM_STATISTICS: (slug: string) => `/teams/${slug}#statistics`,
} as const;
```

### Slug Generation Strategy
```typescript
// Enhanced slug generation
export function generateFixtureSlug(fixture: Fixture): string {
  const homeTeam = fixture.participants?.find(p => p.meta?.location === 'home');
  const awayTeam = fixture.participants?.find(p => p.meta?.location === 'away');
  const date = format(new Date(fixture.starting_at), 'yyyy-MM-dd');
  
  const homeSlug = generateTeamSlug(homeTeam);
  const awaySlug = generateTeamSlug(awayTeam);
  
  return `${fixture.id}-${date}-${homeSlug}-vs-${awaySlug}`;
}
```

## Conclusion

The current URL strategy has good foundations but needs standardization. Moving to a consistent slug-only approach with proper hierarchical structure will significantly improve SEO, user experience, and maintainability.

The migration should be done gradually with proper redirects to maintain backward compatibility and avoid breaking existing links.
