# Team Matches Bug Fix

**Date:** October 11, 2025  
**Issue:** Matches table loads temporarily then reverts to "No Fixtures Found"  
**Status:** ✅ FIXED

---

## 🐛 Problem Description

### Symptoms:
1. ✅ Matches table loads and displays fixtures briefly
2. ❌ Table disappears and shows "No Fixtures Found" message
3. ❌ Date range selector doesn't trigger refetch
4. ❌ Refresh button doesn't work

### User Experience Impact:
- Users couldn't view team fixtures
- Date filtering was non-functional
- Manual refresh failed

---

## 🔍 Root Cause Analysis

### Issue #1: React Query State Management
**Location:** `app/team/[teamId]/[slug]/team-matches-content.tsx:64`

**Problem:**
```typescript
// ❌ WRONG: Empty array is truthy, overrides initialFixtures
const displayFixtures = fixtures || initialFixtures;
```

**What Happened:**
1. Component renders with `initialFixtures` (from server)
2. React Query starts fetching (returns `undefined`)
3. Falls back to `initialFixtures` ✅
4. API returns empty array `[]` 
5. Empty array is truthy, so it replaces `initialFixtures` ❌
6. Component shows "No Fixtures Found" ❌

**Solution:**
```typescript
// ✅ CORRECT: Only use fixtures if explicitly returned
const displayFixtures = fixtures !== undefined ? fixtures : initialFixtures;
```

### Issue #2: API Endpoint Missing Team Parameters
**Location:** `app/api/sportmonks/fixtures/route.ts`

**Problem:**
The API endpoint wasn't handling `teamId`, `startDate`, or `endDate` query parameters. It only used generic `todayDate` filter.

```typescript
// ❌ WRONG: Ignores teamId, startDate, endDate
const filters = searchParams.get('filters') || 'todayDate';
```

**What Happened:**
1. React Query calls: `/api/sportmonks/fixtures?teamId=8579&startDate=2025-10-11&endDate=2025-10-25`
2. API ignores all parameters
3. Returns today's fixtures for ALL teams (not filtered by teamId)
4. Response doesn't match the team
5. Empty results for that specific team

**Solution:**
```typescript
// ✅ CORRECT: Build dynamic filters based on parameters
const teamId = searchParams.get('teamId');
const startDate = searchParams.get('startDate');
const endDate = searchParams.get('endDate');

if (teamId) {
  const filterParts = [`teamId:${teamId}`];
  
  if (startDate && endDate) {
    filterParts.push(`startingAtBetween:${startDate},${endDate}`);
  } else if (startDate) {
    filterParts.push(`startingAtAfter:${startDate}`);
  }
  
  filters = filterParts.join(';');
}
```

### Issue #3: Loading State Indicators
**Problem:**
Used `isLoading` for all loading states, but `isLoading` is only `true` on initial load. Background refetches use `isFetching`.

**Solution:**
```typescript
// For buttons during any fetch
disabled={isFetching}

// For background refetch indicator (not initial load)
{isFetching && !isLoading && displayFixtures.length > 0 && (
  <div>Updating...</div>
)}
```

---

## ✅ Changes Made

### 1. Fixed Data Display Logic
**File:** `app/team/[teamId]/[slug]/team-matches-content.tsx`

**Changes:**
- ✅ Added `isFetching` to React Query destructuring
- ✅ Changed fallback logic: `fixtures !== undefined ? fixtures : initialFixtures`
- ✅ Updated refresh button to use `isFetching` instead of `isLoading`
- ✅ Updated background indicator to show only during background refetch

**Before:**
```typescript
const { data: fixtures, isLoading, error, refetch } = useTeamFixturesQuery({...});
const displayFixtures = fixtures || initialFixtures; // ❌ Bug here
```

**After:**
```typescript
const { data: fixtures, isLoading, error, refetch, isFetching } = useTeamFixturesQuery({...});
const displayFixtures = fixtures !== undefined ? fixtures : initialFixtures; // ✅ Fixed
```

### 2. Enhanced API Endpoint
**File:** `app/api/sportmonks/fixtures/route.ts`

**Changes:**
- ✅ Added `teamId`, `startDate`, `endDate` parameter extraction
- ✅ Dynamic filter building based on provided parameters
- ✅ Improved error logging (`console.error`)

**New Behavior:**
```typescript
// Request: /api/sportmonks/fixtures?teamId=8579&startDate=2025-10-11&endDate=2025-10-25
// Filter: "teamId:8579;startingAtBetween:2025-10-11,2025-10-25"
// Result: Only fixtures for team 8579 in the date range
```

---

## 🧪 Testing Checklist

### Manual Testing:
- [x] ✅ Page loads with fixtures displayed
- [x] ✅ Fixtures persist (don't disappear)
- [x] ✅ Date range selector triggers refetch
- [x] ✅ Refresh button works
- [x] ✅ Loading states display correctly
- [x] ✅ Empty state shows when no fixtures exist
- [x] ✅ Error state handles API failures
- [x] ✅ Background refetch indicator shows during updates

### Expected Behavior:
1. **Initial Load:** Shows fixtures from server (SSR) OR loading skeleton
2. **React Query Fetch:** Loads team-specific fixtures
3. **Date Change:** Automatically refetches with new date range
4. **Refresh Click:** Manually refetches latest data
5. **Background Update:** Shows subtle indicator, doesn't disrupt UI

---

## 📊 React Query State Flow

### Correct Flow:
```
1. Component Mounts
   ├─ fixtures = undefined
   ├─ isLoading = true
   ├─ isFetching = true
   └─ displayFixtures = initialFixtures ✅

2. Initial Fetch Completes
   ├─ fixtures = [fixture1, fixture2, ...]
   ├─ isLoading = false
   ├─ isFetching = false
   └─ displayFixtures = [fixture1, fixture2, ...] ✅

3. Date Range Changes (Background Refetch)
   ├─ fixtures = [old data] (stale but shown)
   ├─ isLoading = false
   ├─ isFetching = true
   └─ displayFixtures = [old data] ✅ (no flicker)

4. Background Fetch Completes
   ├─ fixtures = [new data]
   ├─ isLoading = false
   ├─ isFetching = false
   └─ displayFixtures = [new data] ✅
```

### Key Difference:
- `isLoading`: Only `true` during initial load (no cached data)
- `isFetching`: `true` during any fetch (initial or background)

---

## 🎯 Sportmonks API Filter Format

### Team Fixtures with Date Range:
```
Filter: teamId:8579;startingAtBetween:2025-10-11,2025-10-25
Result: Fixtures for team 8579 between Oct 11 and Oct 25, 2025
```

### Team Fixtures After Date:
```
Filter: teamId:8579;startingAtAfter:2025-10-11
Result: All fixtures for team 8579 after Oct 11, 2025
```

### Default (No Team):
```
Filter: todayDate
Result: All fixtures for today across all teams
```

---

## 🚀 Performance Impact

### Before Fix:
- ❌ Wrong data displayed (all teams' fixtures)
- ❌ Excessive data transfer
- ❌ UI flickering (fixtures disappear)
- ❌ Non-functional date filtering

### After Fix:
- ✅ Correct team-specific data
- ✅ Minimal data transfer (only relevant fixtures)
- ✅ Smooth UI (no flickering)
- ✅ Instant date filtering (with caching)
- ✅ Background updates don't disrupt UX

---

## 📝 Lessons Learned

### 1. React Query State Management
**Lesson:** Distinguish between `undefined` (no data yet) and `[]` (empty result)

**Best Practice:**
```typescript
// ✅ CORRECT: Explicit undefined check
const data = queryData !== undefined ? queryData : fallback;

// ❌ WRONG: Truthy check (empty array is truthy)
const data = queryData || fallback;
```

### 2. API Parameter Handling
**Lesson:** Always validate that API endpoints handle all query parameters

**Best Practice:**
- Extract all parameters from `searchParams`
- Build dynamic filters based on provided parameters
- Log errors for debugging
- Test with different parameter combinations

### 3. Loading State Indicators
**Lesson:** `isLoading` ≠ `isFetching`

**Best Practice:**
```typescript
// Initial load skeleton
if (isLoading && !data) return <Skeleton />;

// Background refetch indicator
if (isFetching && !isLoading) return <UpdateIndicator />;

// Button disabled during any fetch
<Button disabled={isFetching} />
```

---

## 🔗 Related Files

- `app/team/[teamId]/[slug]/team-matches-content.tsx` - Main component
- `app/hooks/useTeamFixturesQuery.ts` - React Query hook
- `app/api/sportmonks/fixtures/route.ts` - API endpoint
- `components/filters/UnifiedDateRangeFilter.tsx` - Date selector
- `docs/TEAM_PAGE_REFACTOR_STRATEGY.md` - Original refactor plan

---

## ✅ Verification

**Build Status:** ✅ Passed  
**Lint Status:** ✅ Passed  
**Commit:** `54cb749`  
**Branch:** `refactor/url-strategy-slug-routing`

**Test URL Examples:**
```
/team/8579/sokol-saratov#matches
/team/123/example-team#matches
```

---

## 🎉 Result

The Team Matches tab now:
- ✅ Loads and displays fixtures correctly
- ✅ Persists data (no flickering)
- ✅ Responds to date range changes
- ✅ Refreshes on button click
- ✅ Shows appropriate loading states
- ✅ Handles empty states gracefully
- ✅ Displays error states when needed

**Status:** Ready for production ✅

