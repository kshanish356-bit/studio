
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

// In a real app, you would add authentication middleware to ensure only admins can access this route.
// For now, it's an open endpoint for demonstration.

export async function GET() {
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
