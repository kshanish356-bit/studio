
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory array to act as a mock database for tour packages
// In a real app, this would be a Firestore collection, a SQL table, etc.
let mockTourPackages: TourPackage[] = [
  { 
    id: 'pkg1', 
    title: 'Jaipur City Day Tour', 
    description: 'Explore the Pink City\'s famous forts and palaces with an experienced local driver.', 
    price: 3500,
    duration: '8 hours', 
    createdBy: 'John Driver',
    creatorRole: 'cabDriver',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'jaipur palace'
  },
  {
    id: 'pkg2',
    title: 'Golden Triangle Discovery',
    description: 'A comprehensive 5-day tour of Delhi, Agra, and Jaipur, curated by our expert agents.',
    price: 30000,
    duration: '5 Days / 4 Nights',
    createdBy: 'Agent Alice',
    creatorRole: 'agent',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'taj mahal'
  }
];

export interface TourPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  createdBy: string;
  creatorRole: 'agent' | 'cabDriver';
  image: string;
  aiHint: string;
}

// GET handler to retrieve all tour packages
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockTourPackages);
  } catch (error) {
    console.error("Error fetching tour packages:", error);
    return NextResponse.json({ message: "Failed to fetch packages", error: (error as Error).message }, { status: 500 });
  }
}

// POST handler to create a new tour package
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, price, duration, createdBy, creatorRole, image, aiHint } = body;

    if (!title || !description || !price || !duration || !createdBy || !creatorRole) {
      return NextResponse.json({ message: 'Missing required fields for tour package.' }, { status: 400 });
    }

    const newPackage: TourPackage = {
      id: `pkg${Date.now()}`,
      title,
      description,
      price: Number(price),
      duration,
      createdBy,
      creatorRole,
      image: image || 'https://placehold.co/600x400.png',
      aiHint: aiHint || 'travel landscape'
    };

    mockTourPackages.unshift(newPackage); // Add to the beginning of the array

    return NextResponse.json({ message: 'Tour package created successfully.', tourPackage: newPackage }, { status: 201 });
  } catch (error) {
    console.error("Error creating tour package:", error);
    return NextResponse.json({ message: "Failed to create package", error: (error as Error).message }, { status: 500 });
  }
}
