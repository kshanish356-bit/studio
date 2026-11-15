import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/firebase/admin'; // Using Firebase Admin SDK

const firebaseUnavailable = () =>
  NextResponse.json(
    { message: 'Firebase Admin is not configured. Please configure the server environment.' },
    { status: 503 },
  );

export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  const uid = params.uid;
  if (!uid) {
    return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
  }
  if (!db) return firebaseUnavailable();

  try {
    const userDocRef = db.collection('users').doc(uid);
    const docSnap = await userDocRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ message: 'User role not found.' }, { status: 404 });
    }
    return NextResponse.json(docSnap.data());
  } catch (error) {
    console.error('Error fetching user role:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to fetch user role.', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { uid: string } }) {
  const uid = params.uid;
  if (!uid) {
    return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
  }
  if (!db) return firebaseUnavailable();

  try {
    const { name, email, primaryRole, partnerRole } = await request.json();

    if (!name || !email || !primaryRole) {
      return NextResponse.json({ message: 'Name, email, and primaryRole are required.' }, { status: 400 });
    }
    if (primaryRole === 'partner' && partnerRole === undefined) {
      // partnerRole may be null if the partner has not selected a role yet.
    }

    const userDocRef = db.collection('users').doc(uid);
    const userData = {
      uid,
      name,
      email,
      primaryRole,
      partnerRole: partnerRole !== undefined ? partnerRole : null,
      createdAt: new Date().toISOString(),
    };

    await userDocRef.set(userData, { merge: true });

    return NextResponse.json({ message: 'User role created/updated successfully.', userData }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating user role:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to create/update user role.', error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { uid: string } }) {
  const uid = params.uid;
  if (!uid) {
    return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
  }
  if (!db) return firebaseUnavailable();

  try {
    const { name, image, partnerRole } = await request.json();

    const updates: { [key: string]: any } = {};
    if (name !== undefined) updates.name = name;
    if (image !== undefined) updates.image = image;
    if (partnerRole !== undefined) updates.partnerRole = partnerRole;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.update(updates);

    return NextResponse.json({ message: 'User role updated successfully.' });
  } catch (error) {
    console.error('Error updating user role:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to update user role.', error: errorMessage }, { status: 500 });
  }
}
