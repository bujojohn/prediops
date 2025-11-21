/**
 * Breadcrumb utility functions for generating breadcrumb navigation
 */

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

/**
 * Convert a path segment to a readable label
 */
function formatSegment(segment: string): string {
  // Remove ID prefixes if present (e.g., "123-manchester-united" -> "manchester-united")
  const parts = segment.split('-');
  const withoutId = parts.length > 1 && /^\d+$/.test(parts[0]) 
    ? parts.slice(1).join('-')
    : segment;
  
  // Convert kebab-case to Title Case
  return withoutId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate breadcrumbs from a pathname
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Always start with Home
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return [{ label: 'Home', href: '/', isCurrent: true }];
  }

  // Split pathname into segments and filter out empty strings
  const segments = pathname.split('/').filter(Boolean);

  // Override labels for common routes
  const routeLabels: Record<string, string> = {
    'predictions': 'Predictions',
    'value-bets': 'Value Bets',
    'live': 'Live Matches',
    'team': 'Team',
    'country': 'Country',
    'league': 'League',
    'fixture': 'Fixture',
  };

  // Build breadcrumbs from segments
  let currentPath = '';
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const nextSegment = segments[i + 1];
    const isLast = i === segments.length - 1;
    
    // Skip numeric IDs in the path (they're followed by slugs)
    // Pattern: /team/123/manchester-united or /country/456/england
    if (/^\d+$/.test(segment) && nextSegment) {
      // Include the ID in the path but skip showing it in breadcrumb
      currentPath += `/${segment}`;
      continue;
    }

    currentPath += `/${segment}`;
    
    // Special handling for known route patterns
    let label = formatSegment(segment);
    
    // Check if this is a top-level route with a known label
    if (routeLabels[segment]) {
      label = routeLabels[segment];
    }

    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrent: isLast
    });
  }

  return breadcrumbs;
}

