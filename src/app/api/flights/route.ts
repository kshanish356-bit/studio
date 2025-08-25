
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  if (!from || !to || !date) {
    return NextResponse.json({ message: 'Missing required query parameters: from, to, date' }, { status: 400 });
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === 'YOUR_AVIATIONSTACK_API_KEY') {
    console.warn('AviationStack API key is not configured.');
    // Return mock data if API key is not set
    const mockData = {
      data: [
        {
          departure: { iata: 'DEL', scheduled: '2024-07-25T20:15:00+00:00', airport: 'Indira Gandhi International' },
          arrival: { iata: 'BLR', scheduled: '2024-07-25T23:15:00+00:00', airport: 'Kempegowda International' },
          airline: { name: 'IndiGo' },
          flight: { number: '6E-202' }
        },
        {
            departure: { iata: 'BOM', scheduled: '2024-07-25T18:30:00+00:00', airport: 'Chhatrapati Shivaji Maharaj International' },
            arrival: { iata: 'CCU', scheduled: '2024-07-25T21:00:00+00:00', airport: 'Netaji Subhas Chandra Bose International' },
            airline: { name: 'Vistara' },
            flight: { number: 'UK-777' }
        }
      ]
    };
    return NextResponse.json(mockData);
  }

  // Note: AviationStack free tier often uses `flights` endpoint without date, or requires paid for `historical`
  // This example uses the `flights` endpoint which gives real-time data but might not match the selected date on free plan.
  // Using flight_date in the API call for a more specific query.
  const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${from}&arr_iata=${to}&flight_date=${date}&limit=10`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('AviationStack API Error:', errorData);
      return NextResponse.json({ message: 'Error fetching flight data from provider', error: errorData }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch flights:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
