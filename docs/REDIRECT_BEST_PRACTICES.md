# Redirect Best Practices - Scalable Global Management

## Overview

This document outlines best practices for managing redirects at scale in a Next.js application, covering various strategies, tools, and approaches for maintainable redirect management.

---

## 1. Redirect Strategy Hierarchy

### **Order of Implementation** (Best Practices)

```
1. next.config.js redirects        ← Static, build-time redirects
2. Middleware                      ← Dynamic, request-time redirects  
3. API Routes                      ← Programmatic redirects
4. Server Components               ← Last resort, component-level redirects
```

---

## 2. Next.js Config Redirects (Recommended for Static Redirects)

### **File:** `next.config.js`

**Best for:**
- ✅ Simple path-to-path redirects
- ✅ Static redirects that don't require logic
- ✅ Performance-critical redirects
- ✅ CDN-cacheable redirects

**Example:**
```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      // Simple redirect
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true, // 301
      },
      
      // With parameters
      {
        source: '/blog/:slug',
        destination: '/news/:slug',
        permanent: true,
      },
      
      // With wildcard
      {
        source: '/old-blog/:slug*',
        destination: '/blog/:slug*',
        permanent: true,
      },
      
      // Query string matching
      {
        source: '/user',
        has: [
          {
            type: 'query',
            key: 'id',
          },
        ],
        destination: '/users/:id',
        permanent: false, // 307
      },
    ];
  },
};
```

**Pros:**
- ⚡ **Fastest** - Handled at build time
- 🌐 **CDN-friendly** - Can be cached at edge
- 📊 **SEO-optimized** - Proper status codes
- 🔧 **Type-safe** - Validated at build time

**Cons:**
- ❌ Requires rebuild for changes
- ❌ Limited dynamic logic
- ❌ Can't access database

---

## 3. Middleware (Recommended for Dynamic Redirects)

### **File:** `middleware.ts`

**Best for:**
- ✅ Dynamic redirects based on request data
- ✅ URL pattern matching
- ✅ A/B testing redirects
- ✅ Geolocation-based redirects
- ✅ Authentication redirects

**Current Implementation:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Dynamic redirect logic
  if (pathname.startsWith('/predictions/country/') && searchParams.has('id')) {
    const countryId = searchParams.get('id');
    const pathParts = pathname.split('/').filter(part => part);
    const oldSlug = pathParts[pathParts.length - 1];
    
    if (countryId && oldSlug && isNaN(Number(oldSlug))) {
      const newUrl = new URL(request.url);
      newUrl.pathname = `/predictions/country/${countryId}/${oldSlug}`;
      newUrl.searchParams.delete('id');
      
      return NextResponse.redirect(newUrl, { status: 301 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/predictions/:path*'],
};
```

**Pros:**
- ⚡ **Fast** - Runs at edge
- 🔄 **Dynamic** - Can use request data
- 🎯 **Targeted** - Matcher config for performance
- 🔧 **Real-time** - No rebuild needed

**Cons:**
- ❌ Runs on every matching request
- ❌ Limited execution time
- ❌ Can't access database directly

---

## 4. Database-Driven Redirects (Scalable Approach)

### **Architecture for Large-Scale Redirects**

#### **A. Database Schema**

```sql
-- redirects table
CREATE TABLE redirects (
  id SERIAL PRIMARY KEY,
  source_path VARCHAR(500) NOT NULL UNIQUE,
  destination_path VARCHAR(500) NOT NULL,
  status_code INTEGER DEFAULT 301,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_source_path (source_path),
  INDEX idx_is_active (is_active)
);

-- redirect_rules table (for pattern matching)
CREATE TABLE redirect_rules (
  id SERIAL PRIMARY KEY,
  pattern VARCHAR(500) NOT NULL,
  replacement VARCHAR(500) NOT NULL,
  priority INTEGER DEFAULT 0,
  is_regex BOOLEAN DEFAULT false,
  status_code INTEGER DEFAULT 301,
  is_active BOOLEAN DEFAULT true,
  
  INDEX idx_priority (priority DESC)
);
```

#### **B. Redis Caching Layer**

```typescript
// lib/redirects/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedRedirect(sourcePath: string) {
  const cached = await redis.get(`redirect:${sourcePath}`);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedRedirect(
  sourcePath: string, 
  destination: { path: string; statusCode: number }
) {
  await redis.set(
    `redirect:${sourcePath}`,
    JSON.stringify(destination),
    'EX',
    86400 // 24 hours
  );
}
```

#### **C. Redirect Service**

```typescript
// lib/redirects/service.ts
import { prisma } from '@/lib/prisma';
import { getCachedRedirect, setCachedRedirect } from './cache';

export async function findRedirect(sourcePath: string) {
  // 1. Check cache first
  const cached = await getCachedRedirect(sourcePath);
  if (cached) return cached;

  // 2. Check exact match in database
  const redirect = await prisma.redirects.findFirst({
    where: {
      source_path: sourcePath,
      is_active: true,
    },
  });

  if (redirect) {
    const result = {
      path: redirect.destination_path,
      statusCode: redirect.status_code,
    };
    
    // Update hit count (fire and forget)
    prisma.redirects.update({
      where: { id: redirect.id },
      data: {
        hit_count: { increment: 1 },
        last_hit_at: new Date(),
      },
    }).catch(console.error);

    // Cache for future requests
    await setCachedRedirect(sourcePath, result);
    return result;
  }

  // 3. Check pattern rules
  const rules = await prisma.redirect_rules.findMany({
    where: { is_active: true },
    orderBy: { priority: 'desc' },
  });

  for (const rule of rules) {
    if (rule.is_regex) {
      const regex = new RegExp(rule.pattern);
      if (regex.test(sourcePath)) {
        const destination = sourcePath.replace(regex, rule.replacement);
        const result = {
          path: destination,
          statusCode: rule.status_code,
        };
        await setCachedRedirect(sourcePath, result);
        return result;
      }
    } else {
      // Simple wildcard matching
      if (sourcePath.startsWith(rule.pattern.replace('*', ''))) {
        const destination = sourcePath.replace(
          rule.pattern.replace('*', ''),
          rule.replacement.replace('*', '')
        );
        const result = {
          path: destination,
          statusCode: rule.status_code,
        };
        await setCachedRedirect(sourcePath, result);
        return result;
      }
    }
  }

  return null;
}
```

#### **D. Middleware Integration**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { findRedirect } from '@/lib/redirects/service';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check database for redirect
  const redirect = await findRedirect(pathname);
  
  if (redirect) {
    const newUrl = new URL(redirect.path, request.url);
    return NextResponse.redirect(newUrl, { 
      status: redirect.statusCode 
    });
  }

  // Continue with existing middleware logic...
  return NextResponse.next();
}
```

---

## 5. Admin Interface for Redirect Management

### **A. Dashboard Page**

```typescript
// app/admin/redirects/page.tsx
import { RedirectsList } from './redirects-list';
import { AddRedirectForm } from './add-redirect-form';

export default async function RedirectsAdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Redirect Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Redirect */}
        <div className="lg:col-span-1">
          <AddRedirectForm />
        </div>
        
        {/* Redirects List */}
        <div className="lg:col-span-2">
          <RedirectsList />
        </div>
      </div>
    </div>
  );
}
```

### **B. API Routes**

```typescript
// app/api/admin/redirects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const redirects = await prisma.redirects.findMany({
    orderBy: { created_at: 'desc' },
    take: 100,
  });
  
  return NextResponse.json(redirects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const redirect = await prisma.redirects.create({
    data: {
      source_path: body.sourcePath,
      destination_path: body.destinationPath,
      status_code: body.statusCode || 301,
      is_active: true,
    },
  });
  
  // Clear cache
  await redis.del(`redirect:${body.sourcePath}`);
  
  // Revalidate admin page
  revalidatePath('/admin/redirects');
  
  return NextResponse.json(redirect);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  await prisma.redirects.delete({
    where: { id: parseInt(id!) },
  });
  
  revalidatePath('/admin/redirects');
  
  return NextResponse.json({ success: true });
}
```

---

## 6. CSV/Bulk Import for Migrations

### **Import Script**

```typescript
// scripts/import-redirects.ts
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { prisma } from '@/lib/prisma';

async function importRedirects(csvFilePath: string) {
  const fileContent = readFileSync(csvFilePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Importing ${records.length} redirects...`);

  for (const record of records) {
    try {
      await prisma.redirects.upsert({
        where: { source_path: record.source },
        update: {
          destination_path: record.destination,
          status_code: parseInt(record.status_code) || 301,
        },
        create: {
          source_path: record.source,
          destination_path: record.destination,
          status_code: parseInt(record.status_code) || 301,
        },
      });
      console.log(`✓ ${record.source} → ${record.destination}`);
    } catch (error) {
      console.error(`✗ Failed: ${record.source}`, error);
    }
  }

  console.log('Import complete!');
}

// Run: npm run import-redirects redirects.csv
importRedirects(process.argv[2]);
```

**CSV Format:**
```csv
source,destination,status_code
/old-url,/new-url,301
/another-old,/another-new,301
```

---

## 7. Monitoring & Analytics

### **A. Redirect Analytics**

```typescript
// app/api/admin/redirects/analytics/route.ts
export async function GET() {
  const stats = await prisma.redirects.aggregate({
    _sum: { hit_count: true },
    _count: true,
  });

  const topRedirects = await prisma.redirects.findMany({
    orderBy: { hit_count: 'desc' },
    take: 10,
  });

  return NextResponse.json({
    totalRedirects: stats._count,
    totalHits: stats._sum.hit_count,
    topRedirects,
  });
}
```

### **B. Health Check**

```typescript
// app/api/health/redirects/route.ts
export async function GET() {
  const activeCount = await prisma.redirects.count({
    where: { is_active: true },
  });

  const recentHits = await prisma.redirects.count({
    where: {
      last_hit_at: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
      },
    },
  });

  return NextResponse.json({
    status: 'healthy',
    activeRedirects: activeCount,
    recentHits,
    timestamp: new Date(),
  });
}
```

---

## 8. Testing Redirects

### **A. Unit Tests**

```typescript
// __tests__/redirects/middleware.test.ts
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

describe('Redirect Middleware', () => {
  it('should redirect old country URLs', async () => {
    const request = new NextRequest(
      'http://localhost:3000/predictions/country/spain?id=32'
    );

    const response = await middleware(request);

    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe(
      '/predictions/country/32/spain'
    );
  });

  it('should preserve query parameters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/predictions/country/spain?id=32&tab=fixtures'
    );

    const response = await middleware(request);

    expect(response.headers.get('location')).toBe(
      '/predictions/country/32/spain?tab=fixtures'
    );
  });
});
```

### **B. E2E Tests**

```typescript
// e2e/redirects.spec.ts
import { test, expect } from '@playwright/test';

test('redirects work correctly', async ({ page, context }) => {
  // Navigate to old URL
  const response = await page.goto(
    '/predictions/country/spain?id=32'
  );

  // Should redirect
  expect(response?.status()).toBe(200);
  expect(page.url()).toContain('/predictions/country/32/spain');
});
```

---

## 9. Performance Optimization

### **Best Practices:**

1. **Cache Aggressively**
   ```typescript
   // Use Redis with TTL
   await redis.set('redirect:key', value, 'EX', 86400);
   ```

2. **Minimize Database Queries**
   ```typescript
   // Load all redirects into memory at startup
   const redirectsMap = new Map(
     redirects.map(r => [r.source_path, r.destination_path])
   );
   ```

3. **Use Matcher Config**
   ```typescript
   // Only run middleware on relevant paths
   export const config = {
     matcher: ['/predictions/:path*', '/old-urls/:path*'],
   };
   ```

4. **Implement Circuit Breaker**
   ```typescript
   // Skip redirect check if database is slow
   const timeout = setTimeout(() => {
     return NextResponse.next(); // Continue without redirect
   }, 50); // 50ms timeout
   ```

---

## 10. Recommended Approach for Your App

### **Hybrid Strategy:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory map for hot paths (loaded at startup)
const staticRedirects = new Map([
  ['/old-predictions', '/predictions'],
  ['/old-leagues', '/predictions/leagues'],
]);

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Check static redirects first (fastest)
  if (staticRedirects.has(pathname)) {
    const newUrl = new URL(request.url);
    newUrl.pathname = staticRedirects.get(pathname)!;
    return NextResponse.redirect(newUrl, { status: 301 });
  }

  // 2. Pattern-based redirects (current implementation)
  if (pathname.startsWith('/predictions/country/') && searchParams.has('id')) {
    // Your existing logic...
  }

  // 3. Database lookup for custom redirects (optional)
  // const dbRedirect = await findRedirect(pathname);
  // if (dbRedirect) { ... }

  return NextResponse.next();
}
```

---

## 11. Migration Checklist

- [ ] Audit all current redirects
- [ ] Choose redirect strategy (config vs middleware vs database)
- [ ] Set up monitoring
- [ ] Create admin interface (if needed)
- [ ] Implement caching layer
- [ ] Write tests
- [ ] Document redirect patterns
- [ ] Set up alerts for 404s
- [ ] Monitor redirect performance
- [ ] Plan for future redirects

---

## 12. Tools & Resources

### **Redirect Management Tools:**
- **Vercel Edge Config** - Built-in redirect management
- **Cloudflare Workers** - Edge redirects
- **AWS CloudFront** - Lambda@Edge redirects
- **Netlify _redirects** - File-based redirects

### **Analytics Tools:**
- Google Search Console - Monitor crawl errors
- Sentry - Track redirect errors
- Mixpanel/Amplitude - User flow analysis

---

## Conclusion

**For Your Current Needs:**
- ✅ **Middleware** for dynamic pattern-based redirects ← Current approach
- ✅ **next.config.js** for static redirects
- 🔄 **Consider database** if redirects exceed 100+

**Key Takeaway:** Start simple (middleware), scale to database when needed.

---

**Related Files:**
- `middleware.ts` - Current implementation
- `next.config.js` - Static redirects configuration
- `docs/URL_REDIRECT_STRATEGY.md` - Current redirect documentation

**Further Reading:**
- [Next.js Redirects Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/redirects)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

