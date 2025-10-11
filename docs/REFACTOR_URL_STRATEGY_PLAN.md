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

### Notes
- This plan will be implemented incrementally in small, reviewable commits.
- Draft PR will be used to capture feedback before major code changes.

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
