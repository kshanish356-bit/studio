
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allHotels = [
  { id: 1, name: 'The Oberoi Grand', location: 'Kolkata, West Bengal', rating: 4.9, price: 15000, amenities: ['wifi', 'parking', 'pool'] },
  { id: 2, name: 'Taj Falaknuma Palace', location: 'Hyderabad, Telangana', rating: 5.0, price: 35000, amenities: ['wifi', 'parking', 'pool', 'restaurant'] },
  { id: 3, name: 'The Leela Palace', location: 'Udaipur, Rajasthan', rating: 4.8, price: 28000, amenities: ['wifi', 'parking', 'pool', 'restaurant', 'ac'] },
  { id: 4, name: 'Wildflower Hall', location: 'Shimla, Himachal Pradesh', rating: 4.7, price: 22000, amenities: ['wifi', 'parking', 'restaurant', 'ac'] },
  { id: 5, name: 'Spice Village - CGH Earth', location: 'Thekkady, Kerala', rating: 4.6, price: 18000, amenities: ['wifi', 'parking', 'pool'] },
  { id: 6, name: 'The Imperial', location: 'New Delhi, Delhi', rating: 4.9, price: 20000, amenities: ['wifi', 'parking', 'pool', 'restaurant', 'ac'] },
];

export async function GET(request: NextRequest) {
  // This endpoint now returns the mock data for the AI tool to use.
  // The actual frontend page will use this same mock data directly.
  return NextResponse.json(allHotels);
}
