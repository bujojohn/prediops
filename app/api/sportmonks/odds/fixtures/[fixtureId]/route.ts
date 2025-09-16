import { NextResponse } from 'next/server';
import { sportmonks } from '@/lib/sportmonks';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params || {};
  if (!fixtureId) {
    return NextResponse.json(
      { success: false, message: 'fixtureId is required' },
      { status: 400 }
    );
  }

  try {
    console.log('Fetching odds for fixture:', fixtureId);
    const resp = await sportmonks.getOddsByFixtureId(String(fixtureId), {
      include: 'bookmaker;market',
      per_page: 50,
      page: 1,
    });
    console.log('Odds API response:', resp);
    return NextResponse.json({ success: true, data: resp?.data ?? [] }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching odds for fixture', fixtureId, ':', error);
    
    const message = (typeof error === 'object' && error && 'message' in error)
      ? String((error as { message?: unknown }).message ?? '')
      : '';

    if (message.includes('401') || message.toLowerCase().includes('unauthor')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized (401): Please verify API credentials.' },
        { status: 401 }
      );
    }
    if (message.includes('429') || message.toLowerCase().includes('rate')) {
      return NextResponse.json(
        { success: false, message: 'Rate limit reached (429). Please try again shortly.' },
        { status: 429 }
      );
    }
    if (message.includes('503') || message.toLowerCase().includes('unavailable')) {
      return NextResponse.json(
        { success: false, message: 'Service unavailable (503). Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: message || 'Failed to fetch pre-match odds.' },
      { status: 500 }
    );
  }
}
