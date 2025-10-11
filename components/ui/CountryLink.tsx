import Link from 'next/link';
import type { Country } from '@/schemas/country.schema';
import { generateCountryUrl, generateCountryPredictionsUrl } from '@/lib/utils/routing';

interface CountryLinkProps {
  country: Country;
  children?: React.ReactNode;
  className?: string;
  variant?: 'detail' | 'predictions';
  openInNewTab?: boolean;
}

/**
 * Reusable component for linking to country pages
 * Automatically generates SEO-friendly URLs with Sportmonks API IDs + slugs
 * 
 * @example
 * // Link to country detail page
 * <CountryLink country={country} />
 * 
 * // Link to country predictions
 * <CountryLink country={country} variant="predictions" />
 * 
 * // Custom children and styling
 * <CountryLink country={country} className="font-bold">
 *   {country.name} - View Leagues
 * </CountryLink>
 */
export function CountryLink({
  country,
  children,
  className = 'hover:underline',
  variant = 'detail',
  openInNewTab = false
}: CountryLinkProps) {
  const url = variant === 'predictions'
    ? generateCountryPredictionsUrl(country)
    : generateCountryUrl(country);

  const target = openInNewTab ? '_blank' : undefined;
  const rel = openInNewTab ? 'noopener noreferrer' : undefined;

  return (
    <Link
      href={url}
      className={className}
      target={target}
      rel={rel}
    >
      {children || country.name || 'Country'}
    </Link>
  );
}

/**
 * Country link that opens in a new tab (for use in lists, fixtures, etc.)
 */
export function CountryLinkNewTab(props: Omit<CountryLinkProps, 'openInNewTab'>) {
  return <CountryLink {...props} openInNewTab={true} />;
}

/**
 * Country link for navigation (opens in same tab)
 */
export function NavigationCountryLink(props: Omit<CountryLinkProps, 'openInNewTab'>) {
  return <CountryLink {...props} openInNewTab={false} />;
}

export default CountryLink;

