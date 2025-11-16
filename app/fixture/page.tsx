import { redirect } from 'next/navigation';

/**
 * Redirect from /fixture/ to /predictions page
 * Fixtures are primarily displayed in predictions context
 */
export default function FixtureBasePage() {
  redirect('/predictions');
}

