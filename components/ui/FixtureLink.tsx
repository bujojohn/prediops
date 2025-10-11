import Link from 'next/link';
import type { Fixture } from '@/schemas/fixture.schema';
import { generateFixtureUrl } from '@/lib/utils/routing';

interface FixtureLinkProps {
  fixture: Fixture;
  children?: React.ReactNode;
  className?: string;
  openInNewTab?: boolean;
}

/**
 * Reusable component for linking to fixture pages
 * Automatically generates SEO-friendly URLs with Sportmonks API IDs + slugs
 * 
 * @example
 * // Link to fixture detail page
 * <FixtureLink fixture={fixture} />
 * 
 * // Custom children and styling
 * <FixtureLink fixture={fixture} className="font-bold">
 *   View Match Details
 * </FixtureLink>
 */
export function FixtureLink({
  fixture,
  children,
  className = 'hover:underline',
  openInNewTab = false
}: FixtureLinkProps) {
  const url = generateFixtureUrl(fixture);

  const target = openInNewTab ? '_blank' : undefined;
  const rel = openInNewTab ? 'noopener noreferrer' : undefined;

  // Generate default text if no children provided
  const defaultText = (() => {
    const home = fixture.participants?.find(p => p.meta?.location === 'home');
    const away = fixture.participants?.find(p => p.meta?.location === 'away');
    
    if (home?.name && away?.name) {
      return `${home.name} vs ${away.name}`;
    }
    
    return 'View Fixture';
  })();

  return (
    <Link
      href={url}
      className={className}
      target={target}
      rel={rel}
    >
      {children || defaultText}
    </Link>
  );
}

/**
 * Fixture link that opens in a new tab (for use in lists, tables, etc.)
 */
export function FixtureLinkNewTab(props: Omit<FixtureLinkProps, 'openInNewTab'>) {
  return <FixtureLink {...props} openInNewTab={true} />;
}

/**
 * Fixture link for navigation (opens in same tab)
 */
export function NavigationFixtureLink(props: Omit<FixtureLinkProps, 'openInNewTab'>) {
  return <FixtureLink {...props} openInNewTab={false} />;
}

export default FixtureLink;

