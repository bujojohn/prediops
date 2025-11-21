import { redirect } from 'next/navigation';

/**
 * Redirect from /league/ to /leagues listing page
 * This handles breadcrumb navigation from league detail pages
 */
export default function LeagueBasePage() {
  redirect('/leagues');
}

