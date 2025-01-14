import { FirebaseClient, firestore } from "../firebase";

// TODO: Split out retrieval from client creation - Can I store the client in the env?

const usersCollection = 'users';

/**
 * Get the Access Key for a user from the persistent store (Firestore)
 * @param {import('../env.js').Env} env - The environment
 * @param {*} userId - The user ID
d * @returns Promise<Object> - The bucket object OR  null if it doesn't exist
 */
export async function getUserKey(env, userId) {
    // Get the Firestore client from the environment
    let client = env.firestore;
    try {
        // Try and get the document from Firestore. Raise an error if it doesn't exist
        return await firestore.getDocument(client, usersCollection, userId, 'key').then(doc => doc.fields.key.stringValue);
    } catch (e) {
        return null;
    }
}