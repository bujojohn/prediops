import { redirect } from 'next/navigation';

/**
 * Redirect from /predictions/league/ to /leagues listing page
 * This handles breadcrumb navigation from league predictions pages
 */
export default function LeaguePredictionsBasePage() {
  redirect('/leagues');
}

