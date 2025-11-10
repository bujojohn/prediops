## URL Strategy, Slug Routing, and Link Consistency (Refactor Plan)

This document outlines the planned refactor to adopt a hybrid URL strategy using **Sportmonks API IDs** with SEO-friendly slugs, improve link consistency via centralized routing helpers, and ensure bookmarkable navigation across the app.

### Context & Key Requirements
- **Use Sportmonks API IDs** in URLs (not database IDs) for Country, League, Teams, Fixtures, etc.
- Adopt hybrid URL format: `/entity/[apiId]/[slug]` (e.g., `/team/85/manchester-united`)
- Slugs are optional but improve SEO and readability
- Centralize URL generation in `lib/utils/routing.ts` as the single source of truth
- Pages accept both formats: `/team/85` and `/team/85/manchester-united` (slug is ignored if present)
- No database migrations needed - slugs generated dynamically from entity names

### URL Format Examples
- **Team**: `/team/85/manchester-united` or `/team/85`
- **League**: `/league/8/premier-league` or `/league/8`
- **Country**: `/country/462/england` or `/country/462`
- **Fixture**: `/fixture/18535517/manchester-united-vs-liverpool` or `/fixture/18535517`

### Planned Tasks (Checklist)
- [ ] Add slug generation utilities (name → slug conversion)
- [ ] Update `lib/utils/routing.ts` to use API IDs with optional slugs
- [ ] Update route handlers to accept `[id]` or `[id]/[slug]` patterns
- [ ] Replace hardcoded paths with routing helpers across the app
- [ ] Update `TeamLink` and add `LeagueLink`, `CountryLink`, `FixtureLink`
- [ ] Update `SearchResults` and `/api/search` to return canonical URLs
- [ ] Update pages to extract API ID from params (ignore slug)
- [ ] Ensure tab states remain bookmarkable with `?tab=` across pages
- [ ] Add canonical URL meta tags to prevent duplicate content issues
- [ ] Add tests for link generation and slug handling
- [ ] Update docs and `README` with the final URL strategy

### Implementation Order
1. ✅ Create slug generation utilities
2. ✅ Update centralized routing helpers
3. ✅ Refactor league routes (predictions + detail pages)
4. ✅ Refactor country routes (predictions + detail pages)
5. ✅ Refactor fixture routes (add slug support)
6. ✅ Standardize team routes (already mostly complete)
7. ✅ Update all link components (LeagueLink, CountryLink, etc.)
8. ✅ Update search and navigation to use new URLs
9. ✅ Add canonical meta tags
10. ✅ Test and verify all routes work correctly

### Notes
- This plan will be implemented incrementally in small, reviewable commits.
- Using Sportmonks API IDs + dynamically generated slugs (no DB changes).
- SEO-optimized with keywords in URLs for better search rankings.
- See `docs/REFACTOR_SEO_STRATEGY.md` for detailed SEO implementation guide.

# URL Strategy Refactor Plan

This draft PR will track the slug-first URL refactor. See linked docs for details.

- [ ] Agree URL patterns
- [ ] Decide hybrid vs slug-only
- [ ] Approve redirects and canonical rules
- [ ] Approve fixture slug format
- [ ] Define slug-to-id resolution and caching
- [ ] Migration plan (DB-backed slugs)
- [ ] Rollout & monitoring plan
- [ ] Update search/nav/breadcrumbs
- [ ] Analytics/SEO updates (canonical, sitemap)
