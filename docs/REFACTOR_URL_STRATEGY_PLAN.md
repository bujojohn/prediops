## URL Strategy, Slug Routing, and Link Consistency (Refactor Plan)

This document outlines the planned refactor to adopt a hybrid URL strategy using SEO-friendly slugs with reliable ID fallbacks, improve link consistency via centralized routing helpers, and ensure bookmarkable navigation across the app.

### Context
- Adopt a hybrid URL approach: human-friendly slugs with IDs fallback when necessary.
- Centralize URL generation in `lib/utils/routing.ts` as the single source of truth.
- Introduce slug resolution API endpoints and caching to map slugs to canonical IDs.
- Update sidebar, search, and navigation to use unified route helpers.

### Planned Tasks (Checklist)
- [ ] Add DB migrations for `slug` columns (teams, leagues, countries, fixtures)
- [ ] Backfill slugs; enforce unique indexes; add slug derivation utilities
- [ ] Add slug resolution APIs (`/api/{entity}/[slug]`) returning canonical ID
- [ ] Update `lib/utils/routing.ts` routes to hybrid format and helpers
- [ ] Replace hardcoded paths with routing helpers across the app
- [ ] Update `TeamLink` and add `LeagueLink`, `CountryLink`, `FixtureLink`
- [ ] Update `SearchResults` and `/api/search` to return canonical URLs
- [ ] Update pages to accept slug-based params and resolve to IDs server-side
- [ ] Ensure tab states remain bookmarkable with `?tab=` across pages
- [ ] Add tests for link generation and slug resolution
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
