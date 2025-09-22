
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, authAdmin, isFirebaseAdminConfigured, DecodedIdToken } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

interface Ride {
  id: string;
  from: string;
  to: string;
  time: string;
  status: 'Pending' | 'Accepted' | 'Ongoing' | 'Completed' | 'Cancelled';
  fare?: string;
  driverUid?: string;
  passengerId?: string;
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

// Initialize rides collection if it doesn't exist with mock data
async function initializeRides() {
    if (!db) return;
    const ridesRef = db.collection('rides');
    const snapshot = await ridesRef.limit(1).get();
    if (snapshot.empty) {
        console.log('Rides collection is empty, initializing with mock data...');
        const mockRides: Omit<Ride, 'id'>[] = [
            { from: 'Bhopal New Market', to: 'Indore Airport', time: '10:00 AM', status: 'Accepted', fare: '₹1800', driverUid: 'driver1' },
            { from: 'MP Nagar Zone 2', to: 'Bhopal Railway Station', time: '12:30 PM', status: 'Pending', fare: '₹250' },
            { from: 'Airport Road', to: 'City Center Mall', time: '03:15 PM', status: 'Ongoing', fare: '₹300', driverUid: 'driver1' },
            { from: 'Van Vihar National Park', to: 'Upper Lake View Point', time: '05:00 PM', status: 'Completed', fare: '₹150', driverUid: 'driver2' },
        ];
        const batch = db.batch();
        mockRides.forEach(ride => {
            const docRef = ridesRef.doc(); // Firestore generates ID
            batch.set(docRef, { ...ride, createdAt: FieldValue.serverTimestamp() });
        });
        await batch.commit();
        console.log('Mock rides initialized in Firestore.');
    }
}

if (isFirebaseAdminConfigured) {
    initializeRides().catch(console.error);
}

export async function GET(request: NextRequest) {
    if (!isFirebaseAdminConfigured || !db || !authAdmin) {
        return NextResponse.json({ message: "Firebase Admin is not configured." }, { status: 500 });
    }

    const decodedToken = await getUserIdFromToken(request);
    if (!decodedToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // In a real app, you might filter by driverUid based on the authenticated user.
    // For now, we'll fetch based on status similar to the mock logic.
    // const driverUid = decodedToken.uid; 

    try {
        const ridesSnapshot = await db.collection('rides').orderBy('createdAt', 'desc').get();
        const rides = ridesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ride));
        return NextResponse.json(rides);
    } catch (error) {
        console.error("Error fetching rides:", error);
        return NextResponse.json({ message: "Failed to fetch rides", error: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    if (!isFirebaseAdminConfigured || !db || !authAdmin) {
        return NextResponse.json({ message: "Firebase Admin is not configured." }, { status: 500 });
    }

    const decodedToken = await getUserIdFromToken(request);
    if (!decodedToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { rideId, newStatus } = await request.json();

        if (!rideId || !newStatus) {
            return NextResponse.json({ message: 'Ride ID and new status are required.' }, { status: 400 });
        }

        const rideRef = db.collection('rides').doc(rideId);
        const rideDoc = await rideRef.get();

        if (!rideDoc.exists) {
            return NextResponse.json({ message: 'Ride not found.' }, { status: 404 });
        }

        // Optional: Add logic to check if this driver is allowed to update this ride.
        // const rideData = rideDoc.data();
        // if (rideData?.driverUid && rideData.driverUid !== decodedToken.uid) {
        //     return NextResponse.json({ message: 'Forbidden: You are not assigned to this ride.' }, { status: 403 });
        // }

        const updateData: { status: Ride['status'], driverUid?: string } = { status: newStatus };
        if (newStatus === 'Accepted') {
            updateData.driverUid = decodedToken.uid;
        }

        await rideRef.update(updateData);
        
        const updatedRideDoc = await rideRef.get();

        console.log(`Ride ${rideId} status updated to ${newStatus} by ${decodedToken.uid}`);
        return NextResponse.json({ message: 'Ride status updated successfully.', ride: { id: updatedRideDoc.id, ...updatedRideDoc.data() } });

    } catch (error) {
        console.error("Error updating ride status:", error);
        return NextResponse.json({ message: "Failed to update ride status", error: (error as Error).message }, { status: 500 });
    }
}
