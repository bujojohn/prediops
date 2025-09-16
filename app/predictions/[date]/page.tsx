import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

export default async function PredictionsByDatePage({ 
  params 
}: { 
  params: Promise<{ date: string }> 
}) {
  const { date } = await params;
  
  // Validate date format (YYYY-MM-DD)
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  
  if (!isValidDate) {
    notFound();
  }
  
  // Validate that it's a reasonable date (not too far in past/future)
  const dateObj = new Date(date);
  const now = new Date();
  const yearDiff = Math.abs(dateObj.getFullYear() - now.getFullYear());
  
  if (yearDiff > 10) {
    notFound();
  }
  
  // Redirect to the main predictions page with the date as a query parameter
  redirect(`/predictions?date=${date}`);
}
