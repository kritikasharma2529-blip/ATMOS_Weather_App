import { NextRequest, NextResponse } from 'next/server';
import { searchCities } from '@/lib/api/weatherProvider';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_PARAMS',
          message: 'Search query "q" must be at least 2 characters long.',
          status: 400,
        },
      },
      { status: 400 }
    );
  }

  const customKey = request.headers.get('x-weather-api-key') || undefined;

  try {
    const results = await searchCities(q, customKey);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in search autocomplete:', error);
    return NextResponse.json(
      {
        error: {
          code: 'PROVIDER_ERROR',
          message: 'Search service failed to resolve query.',
          status: 502,
        },
      },
      { status: 502 }
    );
  }
}
