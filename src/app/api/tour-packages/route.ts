
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory array to act as a mock database for tour packages
// In a real app, this would be a Firestore collection, a SQL table, etc.
let mockTourPackages: TourPackage[] = [
  { 
    id: 'pkg1', 
    title: 'Jaipur City Day Tour', 
    description: 'Explore the Pink City\'s famous forts and palaces with an experienced local driver. This tour covers Amber Fort, Hawa Mahal, City Palace, and Jantar Mantar.', 
    price: 3500,
    duration: '8 hours', 
    createdBy: 'John Driver',
    creatorRole: 'cabDriver',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'jaipur palace',
    isFeatured: true,
    rating: 4.8,
    reviews: [
      { user: 'Alice', comment: 'Fantastic tour, our driver was very knowledgeable!', stars: 5 },
      { user: 'Bob', comment: 'Great way to see the city.', stars: 4 },
    ],
    itinerary: 'Morning: Visit Amber Fort.\nAfternoon: Explore Hawa Mahal and City Palace.\nEvening: See Jantar Mantar and local markets.'
  },
  {
    id: 'pkg2',
    title: 'Golden Triangle Discovery',
    description: 'A comprehensive 5-day tour of Delhi, Agra, and Jaipur, curated by our expert agents. Witness the splendor of the Taj Mahal and the grandeur of Rajput forts.',
    price: 30000,
    duration: '5 Days / 4 Nights',
    createdBy: 'Agent Alice',
    creatorRole: 'agent',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'taj mahal',
    isFeatured: false,
    rating: 4.9,
    reviews: [
        { user: 'Charlie', comment: 'An unforgettable experience! Everything was perfectly organized.', stars: 5 }
    ],
    itinerary: 'Day 1: Delhi Arrival & Sightseeing.\nDay 2: Delhi to Agra, visit Taj Mahal.\nDay 3: Agra to Jaipur via Fatehpur Sikri.\nDay 4: Jaipur Sightseeing.\nDay 5: Departure from Jaipur.'
  }
];

export interface Review {
  user: string;
  comment: string;
  stars: number;
}

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
  isFeatured: boolean;
  rating: number;
  reviews: Review[];
  itinerary: string;
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
    const { title, description, price, duration, createdBy, creatorRole, image, aiHint, isFeatured, itinerary } = body;

    if (!title || !description || !price || !duration || !createdBy || !creatorRole || !itinerary) {
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
      aiHint: aiHint || 'travel landscape',
      isFeatured: !!isFeatured,
      rating: 0, // New packages start with 0 rating
      reviews: [],
      itinerary,
    };

    mockTourPackages.unshift(newPackage); // Add to the beginning of the array

    return NextResponse.json({ message: 'Tour package created successfully.', tourPackage: newPackage }, { status: 201 });
  } catch (error) {
    console.error("Error creating tour package:", error);
    return NextResponse.json({ message: "Failed to create package", error: (error as Error).message }, { status: 500 });
  }
}

// Handler for adding a review
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const packageId = searchParams.get('packageId');
        
        if (!packageId) {
            return NextResponse.json({ message: 'Package ID is required.' }, { status: 400 });
        }

        const body = await request.json();
        const { user, comment, stars } = body as Review;

        if (!user || !comment || stars === undefined) {
            return NextResponse.json({ message: 'User, comment, and stars are required for a review.' }, { status: 400 });
        }

        const packageIndex = mockTourPackages.findIndex(p => p.id === packageId);

        if (packageIndex === -1) {
            return NextResponse.json({ message: 'Tour package not found.' }, { status: 404 });
        }
        
        const tourPackage = mockTourPackages[packageIndex];
        const newReview: Review = { user, comment, stars: Number(stars) };
        tourPackage.reviews.push(newReview);

        // Recalculate average rating
        const totalStars = tourPackage.reviews.reduce((acc, review) => acc + review.stars, 0);
        tourPackage.rating = parseFloat((totalStars / tourPackage.reviews.length).toFixed(1));

        mockTourPackages[packageIndex] = tourPackage;

        return NextResponse.json({ message: 'Review added successfully.', tourPackage });

    } catch (error) {
        console.error("Error adding review:", error);
        return NextResponse.json({ message: "Failed to add review", error: (error as Error).message }, { status: 500 });
    }
}
