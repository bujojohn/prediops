# Route Conflict Resolution

## Issue: Server Start Error

### Error Message
```
Error: You cannot use different slug names for the same dynamic path 
('id' !== 'leagueId')
```

### Root Cause

Next.js detected conflicting dynamic route segments at the same path level. We had multiple routes using different parameter names (`[id]` vs `[leagueId]`) in the same route hierarchy.

### Conflicting Routes Found

1. **API Routes:**
   - ❌ `app/api/sportmonks/leagues/[id]/fixtures/route.ts` (OLD)
   - ✅ `app/api/sportmonks/leagues/[leagueId]/fixtures/route.ts` (NEW)

2. **Page Routes:**
   - ❌ `app/league/[id]/page.tsx` (OLD - legacy with mock data)
   - ✅ `app/predictions/league/[leagueId]/[slug]/page.tsx` (NEW)

### Resolution

**Deleted the following legacy/duplicate routes:**

```bash
# Removed via git
git rm -rf "app/api/sportmonks/leagues/[id]"
git rm -rf "app/league"
```

**Files Deleted:**
- `app/api/sportmonks/leagues/[id]/fixtures/route.ts`
- `app/league/[id]/page.tsx`
- `app/league/[id]/league-client.tsx`
- `app/league/[id]/loading.tsx`

### Why This Happened

During the URL strategy refactoring from the old pattern to the new hybrid pattern, some legacy routes were not properly cleaned up:

**Old Pattern:**
```
/league/[id]                    # Used numeric ID directly
/api/sportmonks/leagues/[id]    # Inconsistent parameter naming
```

**New Pattern:**
```
/predictions/league/[leagueId]/[slug]        # Hybrid approach with descriptive slugs
/api/sportmonks/leagues/[leagueId]/fixtures  # Consistent parameter naming
```

### Current Route Structure

All league-related routes now consistently use `[leagueId]`:

**Page Routes:**
```
/predictions/league/[leagueId]/page.tsx                  # Legacy redirect
/predictions/league/[leagueId]/[slug]/page.tsx           # Main league page
/predictions/league/[leagueId]/league-predictions-client.tsx
```

**API Routes:**
```
/api/sportmonks/leagues/[leagueId]/fixtures/route.ts     # League fixtures endpoint
/api/sportmonks/leagues/country/[countryId]/route.ts     # Country leagues endpoint
```

### Prevention

To prevent similar issues in the future:

1. **Consistent Naming:** Always use descriptive parameter names (`[leagueId]`, `[teamId]`, `[countryId]`) rather than generic `[id]`
2. **Clean Up Legacy Routes:** When refactoring URL structure, ensure all old routes are removed
3. **Check for Conflicts:** Before committing route changes, run:
   ```bash
   # Find all dynamic routes
   Get-ChildItem -Path app -Recurse -Directory | Where-Object { $_.Name -match '^\[.*\]$' }
   ```
4. **Test Server Start:** Always test `npm run dev` after route changes

### Commits

- `38937f0` - fix: remove conflicting [id] API route causing slug name conflict
- `36724aa` - fix: remove all conflicting [id] routes - using [leagueId] consistently

### Status

✅ **RESOLVED** - Server now starts successfully without route conflicts.

---

**Branch:** `refactor/url-strategy-slug-routing`  
**Date:** October 11, 2025  
**Related Docs:** 
- [URL Strategy Recommendations](./URL_STRATEGY_RECOMMENDATIONS.md)
- [Refactor Implementation Summary](./REFACTOR_IMPLEMENTATION_SUMMARY.md)

