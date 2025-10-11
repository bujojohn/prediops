import Link from 'next/link';
import type { League } from '@/schemas/league.schema';
import { generateLeagueUrl, generateLeaguePredictionsUrl } from '@/lib/utils/routing';

interface LeagueLinkProps {
  league: League;
  children?: React.ReactNode;
  className?: string;
  variant?: 'detail' | 'predictions';
  openInNewTab?: boolean;
}

/**
 * Reusable component for linking to league pages
 * Automatically generates SEO-friendly URLs with Sportmonks API IDs + slugs
 * 
 * @example
 * // Link to league detail page
 * <LeagueLink league={league} />
 * 
 * // Link to league predictions
 * <LeagueLink league={league} variant="predictions" />
 * 
 * // Custom children and styling
 * <LeagueLink league={league} className="font-bold">
 *   {league.name} - View Details
 * </LeagueLink>
 */
export function LeagueLink({
  league,
  children,
  className = 'hover:underline',
  variant = 'detail',
  openInNewTab = false
}: LeagueLinkProps) {
  const url = variant === 'predictions'
    ? generateLeaguePredictionsUrl(league)
    : generateLeagueUrl(league);

  const target = openInNewTab ? '_blank' : undefined;
  const rel = openInNewTab ? 'noopener noreferrer' : undefined;

  return (
    <Link
      href={url}
      className={className}
      target={target}
      rel={rel}
    >
      {children || league.name || 'League'}
    </Link>
  );
}

/**
 * League link that opens in a new tab (for use in lists, fixtures, etc.)
 */
export function LeagueLinkNewTab(props: Omit<LeagueLinkProps, 'openInNewTab'>) {
  return <LeagueLink {...props} openInNewTab={true} />;
}

/**
 * League link for navigation (opens in same tab)
 */
export function NavigationLeagueLink(props: Omit<LeagueLinkProps, 'openInNewTab'>) {
  return <LeagueLink {...props} openInNewTab={false} />;
}

export default LeagueLink;

