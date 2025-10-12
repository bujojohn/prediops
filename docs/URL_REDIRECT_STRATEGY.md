# URL Redirect Strategy

## Overview

This document outlines the redirect strategy implemented to handle legacy URL patterns and ensure backward compatibility during the URL structure refactoring.

---

## Redirect Types

### 1. **301 Permanent Redirects** (via Middleware)

Handled in `middleware.ts` for old URL patterns with query parameters.

#### **Legacy Country URLs**

**Old Pattern:**
```
/predictions/country/spain?id=32
/predictions/country/england?id=462&tab=fixtures
```

**New Pattern:**
```
/predictions/country/32/spain
/predictions/country/462/england?tab=fixtures
```

**How it works:**
- Middleware detects `?id=` query parameter
- Extracts the `countryId` and `slug` from URL
- Rebuilds URL as `/predictions/country/[countryId]/[slug]`
- Removes `id` from query params
- Preserves other query params (e.g., `tab`, `league`)
- Returns **301 Permanent Redirect**

#### **Legacy League URLs**

**Old Pattern:**
```
/predictions/league/premier-league?id=8
/predictions/league/la-liga?id=564&tab=standings
```

**New Pattern:**
```
/predictions/league/8/premier-league
/predictions/league/564/la-liga?tab=standings
```

**How it works:**
- Middleware detects `?id=` query parameter
- Extracts the `leagueId` and `slug` from URL
- Rebuilds URL as `/predictions/league/[leagueId]/[slug]`
- Removes `id` from query params
- Preserves other query params
- Returns **301 Permanent Redirect**

---

### 2. **Server-Side Redirects** (via Legacy Route Pages)

Handled by dedicated route pages for URLs that use only IDs (no slugs).

#### **Country Legacy Route**

**File:** `app/predictions/country/[countryId]/page.tsx`

**Pattern:**
```
/predictions/country/32  →  /predictions/country/32/spain
```

**How it works:**
- Page component receives `countryId`
- Looks up country data
- Generates canonical slug
- Uses `redirect()` function for server-side redirect
- Preserves query parameters

#### **League Legacy Route**

**File:** `app/predictions/league/[leagueId]/page.tsx`

**Pattern:**
```
/predictions/league/8  →  /predictions/league/8/premier-league
```

**How it works:**
- Page component receives `leagueId`
- Fetches league data from Sportmonks API
- Generates canonical slug
- Uses `redirect()` function for server-side redirect
- Preserves query parameters

---

## Implementation Details

### **Middleware Configuration**

```typescript
// middleware.ts
export const config = {
  matcher: [
    '/predictions/country/:path*',
    '/predictions/league/:path*',
  ],
};
```

**Benefits:**
- Only runs on relevant routes (performance optimization)
- Executes before route handlers
- Can inspect and modify requests/responses
- Perfect for URL rewrites and redirects

---

### **Redirect Flow**

```
Old URL with ?id= param
    ↓
Middleware intercepts
    ↓
Builds new URL pattern
    ↓
301 Redirect to new URL
    ↓
New URL route handler
    ↓
Page renders
```

---

### **Legacy Route Flow**

```
URL with ID only (no slug)
    ↓
Legacy route handler
    ↓
Fetch entity data
    ↓
Generate canonical slug
    ↓
Server redirect to canonical URL
    ↓
Canonical route handler
    ↓
Page renders
```

---

## SEO Benefits

### **301 Permanent Redirects**

✅ **Tells search engines:** "This page has permanently moved"
✅ **Transfers link equity (PageRank)** from old to new URL
✅ **Updates search results** to show new URL
✅ **Prevents duplicate content** issues
✅ **Maintains backlink value**

### **Canonical URLs**

Every page enforces a single, canonical URL format:
```
/predictions/league/[leagueId]/[canonical-slug]
```

If a user visits:
- `/predictions/league/8` → Redirects to `/predictions/league/8/premier-league`
- `/predictions/league/premier-league?id=8` → Redirects to `/predictions/league/8/premier-league`
- `/predictions/league/8/wrong-slug` → Redirects to `/predictions/league/8/premier-league`

This ensures:
- ✅ Consistent URLs across all pages
- ✅ Better SEO (no duplicate content)
- ✅ Cleaner analytics
- ✅ Easier to maintain

---

## Testing Redirects

### **Test Cases**

#### **1. Legacy Country URL with Query Param**
```bash
# Old URL
curl -I http://localhost:3000/predictions/country/spain?id=32

# Expected: 301 redirect to
# Location: /predictions/country/32/spain
```

#### **2. Country ID-Only URL**
```bash
# ID only
curl -I http://localhost:3000/predictions/country/32

# Expected: 30x redirect to
# Location: /predictions/country/32/spain
```

#### **3. Legacy League URL with Query Param**
```bash
# Old URL
curl -I http://localhost:3000/predictions/league/premier-league?id=8

# Expected: 301 redirect to
# Location: /predictions/league/8/premier-league
```

#### **4. League ID-Only URL**
```bash
# ID only
curl -I http://localhost:3000/predictions/league/8

# Expected: 30x redirect to
# Location: /predictions/league/8/premier-league
```

#### **5. Query Parameters Preserved**
```bash
# With additional params
curl -I http://localhost:3000/predictions/country/spain?id=32&tab=fixtures&league=8

# Expected: 301 redirect to
# Location: /predictions/country/32/spain?tab=fixtures&league=8
```

---

## Browser Behavior

### **First Visit**
```
User clicks old link → 301 Redirect → Browser navigates to new URL → Page loads
```

### **Subsequent Visits**
```
Browser remembers 301 → Directly navigates to new URL (cached redirect)
```

---

## Analytics Impact

**Before Redirects:**
- Traffic split across multiple URLs
- Confusing analytics data
- Unclear user behavior

**After Redirects:**
- All traffic consolidated to canonical URLs
- Clean, accurate analytics
- Better understanding of user behavior

---

## Deployment Checklist

### **Pre-Deployment**

- [x] Middleware created and tested
- [x] Legacy route handlers created
- [x] All internal links updated to new pattern
- [x] Documentation updated

### **Post-Deployment**

- [ ] Monitor server logs for redirect activity
- [ ] Check Google Search Console for crawl errors
- [ ] Update sitemap with new URLs
- [ ] Submit updated sitemap to search engines
- [ ] Monitor analytics for traffic patterns
- [ ] Test all old bookmark/link patterns

---

## Maintenance

### **Adding New Entity Types**

When adding redirects for new entity types (e.g., teams, fixtures):

1. **Update Middleware** (if using query params):
   ```typescript
   if (pathname.startsWith('/predictions/team/') && searchParams.has('id')) {
     // Redirect logic
   }
   ```

2. **Create Legacy Route** (if supporting ID-only URLs):
   ```typescript
   // app/predictions/team/[teamId]/page.tsx
   export default async function TeamLegacyRedirect({ params }) {
     // Fetch team, generate slug, redirect
   }
   ```

3. **Update Middleware Config**:
   ```typescript
   export const config = {
     matcher: [
       '/predictions/country/:path*',
       '/predictions/league/:path*',
       '/predictions/team/:path*', // Add new pattern
     ],
   };
   ```

---

## Performance Considerations

### **Middleware Impact**

- ⚡ **Minimal overhead** - Only inspects URLs, doesn't fetch data
- ⚡ **Runs at edge** - Fast response times
- ⚡ **Matcher optimization** - Only runs on relevant routes

### **Legacy Route Impact**

- 🔄 **Requires data fetch** - Must look up entity to generate slug
- 🔄 **Server-side only** - No client-side overhead
- 🔄 **Cached by CDN** - Redirect responses can be cached

---

## Related Files

- `middleware.ts` - Main redirect logic
- `app/predictions/country/[countryId]/page.tsx` - Country legacy redirect
- `app/predictions/league/[leagueId]/page.tsx` - League legacy redirect
- `lib/utils/country-utils.ts` - URL generation utilities
- `lib/utils/slug-utils.ts` - Slug generation utilities

---

## Monitoring

### **Logs to Watch**

```
[Middleware] 301 Redirect: /predictions/country/spain?id=32 → /predictions/country/32/spain
```

### **Metrics to Track**

- Number of 301 redirects per day
- Most common old URL patterns
- Redirect performance (response time)
- Redirect success rate

---

## Conclusion

This redirect strategy ensures:

✅ **Backward Compatibility** - Old URLs continue to work
✅ **SEO Preservation** - Link equity is transferred
✅ **User Experience** - Seamless navigation
✅ **Clean URLs** - Consistent canonical format
✅ **Easy Maintenance** - Centralized redirect logic

---

**Commits:**
- `61fd2a8` - feat: add 301 redirects for legacy URL patterns in middleware
- `5ccc94f` - fix: update country and league URL generation to use new hybrid pattern

**Branch:** `refactor/url-strategy-slug-routing`

