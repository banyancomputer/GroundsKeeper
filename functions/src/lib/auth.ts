import * as admin from 'firebase-admin';
import 'firebase/auth';

// Initialize the Firebase Admin SDK
admin.initializeApp({});

/**
 * authenticate -- return the uid of the authenticated user, or null if not authenticated
 * @param context an onCall context object -- TODO: What type is this?
 * @returns Promise<string | null> -- the uid of the authenticated user, or null if not authenticated
 */
export const authenticate = async (context: any): Promise<string | null> => {
  // Try to get the token from the context
  const token = context.auth?.token;
  return await admin.auth().verifyIdToken(token).then((decodedToken) => {
    const uid = decodedToken.uid;
    console.debug(`Authenticated user ${uid}`);
    return uid;
  }).catch((error) => {
    console.error(`Failed to authenticate user: ${error}`);
    return null;
  });
}
