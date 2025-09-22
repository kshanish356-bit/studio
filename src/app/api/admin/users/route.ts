
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, authAdmin, isFirebaseAdminConfigured } from '@/lib/firebase/admin';

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    try {
      const decodedToken = await authAdmin!.verifyIdToken(idToken);
      const userDoc = await db!.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists && userDoc.data()?.primaryRole === 'admin') {
        return decodedToken.uid;
      }
    } catch (error) {
      console.error('Error verifying admin token:', error);
      return null;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  if (!isFirebaseAdminConfigured || !db || !authAdmin) {
    return NextResponse.json({ message: "Firebase Admin is not configured." }, { status: 500 });
  }

  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ message: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const usersCollection = db.collection('users');
    const snapshot = await usersCollection.get();
    
    if (snapshot.empty) {
      return NextResponse.json([]);
    }
    
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        primaryRole: data.primaryRole,
        partnerRole: data.partnerRole,
        createdAt: data.createdAt,
      };
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Failed to fetch users", error: errorMessage }, { status: 500 });
  }
}
