import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/api/weatherProvider';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const type = searchParams.get('type') || 'both';

  let query = '';

  if (lat && lon) {
    query = `${lat},${lon}`;
  } else if (city) {
    query = city;
  } else {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_PARAMS',
          message: 'Either city or lat + lon parameters are required.',
          status: 400,
        },
      },
      { status: 400 }
    );
  }

  const customKey = request.headers.get('x-weather-api-key') || undefined;

  try {
    const data = await fetchWeather(query, customKey);
    const forecast = data.forecast;

    const result: any = {};
    if (type === 'both' || type === 'hourly') {
      result.hourly = forecast.hourly;
    }
    if (type === 'both' || type === 'weekly') {
      result.weekly = forecast.weekly;
    }

    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    return response;
  } catch (error: any) {
    console.error('Error fetching forecast:', error);

    if (error.message === 'CITY_NOT_FOUND') {
      return NextResponse.json(
        {
          error: {
            code: 'CITY_NOT_FOUND',
            message: 'No matching city found for the given query.',
            status: 404,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'PROVIDER_ERROR',
          message: 'Upstream weather service returned an error.',
          status: 502,
        },
      },
      { status: 502 }
    );
  }
}
