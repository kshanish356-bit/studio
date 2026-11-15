import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, authAdmin, isFirebaseAdminConfigured } from '@/lib/firebase/admin';

const unavailable = () =>
  NextResponse.json(
    { message: 'Firebase Admin is not configured. Please configure the server environment.' },
    { status: 503 },
  );

async function verifyUser(request: NextRequest, uid: string) {
  if (!isFirebaseAdminConfigured || !db || !authAdmin) return { response: unavailable() };

  const authorization = request.headers.get('authorization');
  const idToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!idToken) {
    return { response: NextResponse.json({ message: 'Authentication required.' }, { status: 401 }) };
  }

  try {
    const decoded = await authAdmin.verifyIdToken(idToken);
    if (decoded.uid !== uid) {
      return { response: NextResponse.json({ message: 'You may only access your own profile.' }, { status: 403 }) };
    }
    return { decoded };
  } catch {
    return { response: NextResponse.json({ message: 'Invalid or expired authentication token.' }, { status: 401 }) };
  }
}

const partnerRoles = new Set(['agent', 'cabDriver', 'houseRent']);

export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  const { uid } = params;
  if (!uid) return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });

  const auth = await verifyUser(request, uid);
  if (auth.response) return auth.response;

  try {
    const doc = await db!.collection('users').doc(uid).get();
    if (!doc.exists) return NextResponse.json({ message: 'User role not found.' }, { status: 404 });
    return NextResponse.json(doc.data());
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ message: 'Failed to fetch user role.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { uid: string } }) {
  const { uid } = params;
  if (!uid) return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });

  const auth = await verifyUser(request, uid);
  if (auth.response) return auth.response;

  try {
    const { name, email, primaryRole, partnerRole } = await request.json();
    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ message: 'A name and email are required.' }, { status: 400 });
    }
    // Admin accounts must be provisioned through a trusted server-side process.
    if (primaryRole !== 'user' && primaryRole !== 'partner') {
      return NextResponse.json({ message: 'Invalid primary role.' }, { status: 400 });
    }
    if (primaryRole === 'partner' && partnerRole != null && !partnerRoles.has(partnerRole)) {
      return NextResponse.json({ message: 'Invalid partner role.' }, { status: 400 });
    }
    if (primaryRole === 'user' && partnerRole != null) {
      return NextResponse.json({ message: 'Regular users cannot have a partner role.' }, { status: 400 });
    }

    const userRef = db!.collection('users').doc(uid);
    if ((await userRef.get()).exists) {
      return NextResponse.json({ message: 'User profile already exists.' }, { status: 409 });
    }

    const userData = {
      uid,
      name: name.trim(),
      email: email.trim(),
      primaryRole,
      partnerRole: primaryRole === 'partner' ? partnerRole ?? null : null,
      createdAt: new Date().toISOString(),
    };
    await userRef.create(userData);
    return NextResponse.json({ message: 'User profile created successfully.', userData }, { status: 201 });
  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json({ message: 'Failed to create user profile.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { uid: string } }) {
  const { uid } = params;
  if (!uid) return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });

  const auth = await verifyUser(request, uid);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const updates: Record<string, string> = {};
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ message: 'Name must be a non-empty string.' }, { status: 400 });
      }
      updates.name = body.name.trim();
    }
    if (body.image !== undefined) {
      if (body.image !== null && typeof body.image !== 'string') {
        return NextResponse.json({ message: 'Image must be a URL string or null.' }, { status: 400 });
      }
      // Firestore accepts null values; retain the explicit type at this boundary.
      (updates as Record<string, string | null>).image = body.image;
    }
    if (body.partnerRole !== undefined) {
      if (typeof body.partnerRole !== 'string' || !partnerRoles.has(body.partnerRole)) {
        return NextResponse.json({ message: 'Invalid partner role.' }, { status: 400 });
      }
      updates.partnerRole = body.partnerRole;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No valid update data provided.' }, { status: 400 });
    }

    const userRef = db!.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
    if (body.partnerRole !== undefined && doc.data()?.primaryRole !== 'partner') {
      return NextResponse.json({ message: 'Only partner accounts can set a partner role.' }, { status: 403 });
    }

    await userRef.update({ ...updates, updatedAt: new Date().toISOString() });
    return NextResponse.json({ message: 'User profile updated successfully.' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ message: 'Failed to update user profile.' }, { status: 500 });
  }
}
