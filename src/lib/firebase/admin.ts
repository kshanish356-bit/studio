
import * as admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

// Ensure environment variables are set for Firebase Admin SDK
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID;

const isFirebaseAdminConfigured = privateKey && clientEmail && projectId;

if (!admin.apps.length) {
  if (isFirebaseAdminConfigured) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
    }
  } else {
    console.warn(
      'Firebase Admin SDK is not configured. Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY environment variables. ' +
      'Server-side Firebase features will not work.'
    );
  }
}

const db = isFirebaseAdminConfigured ? admin.firestore() : null;
const authAdmin = isFirebaseAdminConfigured ? admin.auth() : null;

export { db, authAdmin, isFirebaseAdminConfigured, DecodedIdToken };

