
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, authAdmin, isFirebaseAdminConfigured, DecodedIdToken } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface Review {
  user: string;
  comment: string;
  stars: number;
  createdAt: string;
}

export interface TourPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  createdBy: string;
  creatorUid: string;
  creatorRole: 'agent' | 'cabDriver';
  image: string;
  aiHint: string;
  isFeatured: boolean;
  rating: number;
  reviews: Review[];
  itinerary: string;
  createdAt: any;
}


// Helper to verify user token and get UID
async function getUserIdFromToken(request: NextRequest): Promise<DecodedIdToken | null> {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    try {
      const decodedToken = await authAdmin!.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }
  return null;
}

// GET handler to retrieve all tour packages
export async function GET(request: NextRequest) {
    if (!isFirebaseAdminConfigured || !db) {
        return NextResponse.json({ message: "Firebase Admin is not configured." }, { status: 500 });
    }
    try {
        const packagesSnapshot = await db.collection('tour_packages').orderBy('createdAt', 'desc').get();
        if (packagesSnapshot.empty) {
            return NextResponse.json([]);
        }
        const packages = packagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json(packages);
    } catch (error) {
        console.error("Error fetching tour packages:", error);
        return NextResponse.json({ message: "Failed to fetch packages", error: (error as Error).message }, { status: 500 });
    }
}

// POST handler to create a new tour package
export async function POST(request: NextRequest) {
    if (!isFirebaseAdminConfigured || !db || !authAdmin) {
        return NextResponse.json({ message: "Firebase Admin is not configured." }, { status: 500 });
    }

    const decodedToken = await getUserIdFromToken(request);
    if (!decodedToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, description, price, duration, createdBy, creatorRole, image, aiHint, isFeatured, itinerary } = body;

        if (!title || !description || !price || !duration || !createdBy || !creatorRole || !itinerary) {
            return NextResponse.json({ message: 'Missing required fields for tour package.' }, { status: 400 });
        }
        
        // Security check: ensure creatorRole is one of the allowed values
        if (creatorRole !== 'agent' && creatorRole !== 'cabDriver') {
             return NextResponse.json({ message: 'Invalid creator role specified.' }, { status: 400 });
        }


        const newPackageData = {
            title,
            description,
            price: Number(price),
            duration,
            createdBy,
            creatorUid: decodedToken.uid, // Link package to the authenticated user
            creatorRole,
            image: image || 'https://placehold.co/600x400.png',
            aiHint: aiHint || 'travel landscape',
            isFeatured: !!isFeatured,
            rating: 0,
            reviews: [],
            itinerary,
            createdAt: FieldValue.serverTimestamp(), // Use server timestamp
        };

        const docRef = await db.collection('tour_packages').add(newPackageData);

        return NextResponse.json({ message: 'Tour package created successfully.', tourPackage: { id: docRef.id, ...newPackageData } }, { status: 201 });
    } catch (error) {
        console.error("Error creating tour package:", error);
        return NextResponse.json({ message: "Failed to create package", error: (error as Error).message }, { status: 500 });
    }
}

// Handler for adding a review
export async function PATCH(request: NextRequest) {
    if (!isFirebaseAdminConfigured || !db) {
        return NextResponse.json({ message: "Firebase Admin is not configured." }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const packageId = searchParams.get('packageId');
        
        if (!packageId) {
            return NextResponse.json({ message: 'Package ID is required.' }, { status: 400 });
        }

        const body = await request.json();
        const { user, comment, stars } = body as Omit<Review, 'createdAt'>;

        if (!user || !comment || stars === undefined) {
            return NextResponse.json({ message: 'User, comment, and stars are required for a review.' }, { status: 400 });
        }

        const packageRef = db.collection('tour_packages').doc(packageId);
        const packageDoc = await packageRef.get();

        if (!packageDoc.exists) {
            return NextResponse.json({ message: 'Tour package not found.' }, { status: 404 });
        }
        
        const tourPackage = packageDoc.data() as TourPackage;
        
        const newReview: Review = { 
            user, 
            comment, 
            stars: Number(stars),
            createdAt: new Date().toISOString()
        };
        
        const updatedReviews = [...(tourPackage.reviews || []), newReview];
        
        // Recalculate average rating
        const totalStars = updatedReviews.reduce((acc, review) => acc + review.stars, 0);
        const newRating = parseFloat((totalStars / updatedReviews.length).toFixed(1));

        await packageRef.update({
            reviews: updatedReviews,
            rating: newRating
        });
        
        const updatedPackageDoc = await packageRef.get();

        return NextResponse.json({ message: 'Review added successfully.', tourPackage: { id: updatedPackageDoc.id, ...updatedPackageDoc.data() } });

    } catch (error) {
        console.error("Error adding review:", error);
        return NextResponse.json({ message: "Failed to add review", error: (error as Error).message }, { status: 500 });
    }
}

