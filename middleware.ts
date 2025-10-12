import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle legacy URL redirects
 * Provides 301 permanent redirects for old URL patterns
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle legacy country URLs: /predictions/country/[slug]?id=[id]
  // Redirect to: /predictions/country/[id]/[slug]
  if (pathname.startsWith('/predictions/country/') && searchParams.has('id')) {
    const countryId = searchParams.get('id');
    const pathParts = pathname.split('/');
    const oldSlug = pathParts[pathParts.length - 1];
    
    if (countryId && oldSlug) {
      // Build new URL using the countryId and preserving the slug
      const newUrl = new URL(request.url);
      newUrl.pathname = `/predictions/country/${countryId}/${oldSlug}`;
      newUrl.searchParams.delete('id'); // Remove the id query param
      
      // Preserve other query params (like league, tab)
      console.log(`[Middleware] 301 Redirect: ${pathname}?id=${countryId} → ${newUrl.pathname}`);
      
      // Return 301 permanent redirect
      return NextResponse.redirect(newUrl, { status: 301 });
    }
  }

  // Handle legacy league URLs: /predictions/league/[slug]?id=[id]
  // Redirect to: /predictions/league/[id]/[slug]
  if (pathname.startsWith('/predictions/league/') && searchParams.has('id')) {
    const leagueId = searchParams.get('id');
    const pathParts = pathname.split('/');
    const oldSlug = pathParts[pathParts.length - 1];
    
    if (leagueId && oldSlug) {
      // Build new URL
      const newUrl = new URL(request.url);
      newUrl.pathname = `/predictions/league/${leagueId}/${oldSlug}`;
      newUrl.searchParams.delete('id'); // Remove the id query param
      
      console.log(`[Middleware] 301 Redirect: ${pathname}?id=${leagueId} → ${newUrl.pathname}`);
      
      // Return 301 permanent redirect
      return NextResponse.redirect(newUrl, { status: 301 });
    }
  }

  // Continue to the route
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 * Only run on prediction routes to avoid unnecessary overhead
 */
export const config = {
  matcher: [
    '/predictions/country/:path*',
    '/predictions/league/:path*',
  ],
};

