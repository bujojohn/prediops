import { redirect } from 'next/navigation';

/**
 * Redirect from /team/ to /teams listing page
 * This handles breadcrumb navigation from team detail pages
 */
export default function TeamBasePage() {
  redirect('/teams');
}

