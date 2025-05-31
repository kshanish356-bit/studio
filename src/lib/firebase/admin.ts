
import * as admin from 'firebase-admin';

// Ensure environment variables are set for Firebase Admin SDK
// These should be set in your .env.local or deployment environment
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID;

let db: admin.firestore.Firestore;

if (!admin.apps.length) {
  if (privateKey && clientEmail && projectId) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
        // databaseURL: `https://${projectId}.firebaseio.com` // Optional for Firestore
      });
      console.log('Firebase Admin SDK initialized successfully.');
      db = admin.firestore();
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
      // @ts-ignore - Fallback to a dummy db object to prevent app crash, but operations will fail.
      db = {
        collection: () => ({
          doc: () => ({
            get: async () => ({ exists: false, data: () => undefined }),
            set: async () => {},
            update: async () => {},
          }),
        }),
      };
      console.error("CRITICAL: Firebase Admin SDK failed to initialize. API routes using admin features will not work.");
    }
  } else {
    console.warn(
      'Firebase Admin SDK is not configured. Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY environment variables. ' +
      'Server-side Firebase features (like user role management) will not work.'
    );
    // @ts-ignore - Fallback to a dummy db object
     db = {
        collection: () => ({
          doc: () => ({
            get: async () => ({ exists: false, data: () => undefined }),
            set: async () => {},
            update: async () => {},
          }),
        }),
      };
  }
} else {
  // If already initialized, get the existing instance
  db = admin.firestore();
}

export { db };
