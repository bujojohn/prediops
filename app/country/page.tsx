import { redirect } from 'next/navigation';

/**
 * Redirect from /country/ to /countries listing page
 * This handles breadcrumb navigation from country detail pages
 */
export default function CountryBasePage() {
  redirect('/countries');
}

