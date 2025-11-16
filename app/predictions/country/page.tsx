import { redirect } from 'next/navigation';

/**
 * Redirect from /predictions/country/ to /countries listing page
 * This handles breadcrumb navigation from country predictions pages
 */
export default function CountryPredictionsBasePage() {
  redirect('/countries');
}

