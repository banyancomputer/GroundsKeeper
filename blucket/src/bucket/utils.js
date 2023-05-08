import { firestore } from "../firebase";

const bucketsCollection = 'buckets';

export async function createBucket(env, owner, name, key) {
    // Get the Firestore client from the environment 
    let client = env.firestore;
    // Create a new document in Firestore
    return await firestore.createDocument(client, bucketsCollection, {
        name: { stringValue: name },
        owner: { stringValue: owner },
        key: { stringValue: key }
    }).then(doc => doc.name.split('/')[6]);
}

export async function deleteBucket(env, bucketId) {
    // Get the Firestore client from the environment
    let client = env.firestore; 
    // Check if the bucket key exists in R2
    await env.BLOCKSTORE.head(bucketId).then((obj) => {
        if (obj) {
            // If it does, delete it
            return env.BLOCKSTORE.delete(key);
        }
    });
    // Delete the document from Firestore
    return await firestore.deleteDocument(client, bucketsCollection, bucketId);
}

/**
 * Get a key for a bucket from the persistent store (Firestore)
 * @param {import('../env.js').Env} env - The environment
 * @param {*} bucketId - The bucket ID
 * @returns Promise<Object> - The bucket key OR  null if it doesn't exist
 */
export async function getBucketKey(env, bucketId) {
    // Get the Firestore client from the environment
    let client = env.firestore; 
    try {
        // Try and get the document from Firestore. Raise an error if it doesn't exist
        return await firestore.getDocument(client, bucketsCollection, bucketId, 'key').then(doc => doc.fields.key.stringValue);
    } catch (e) {
        return null;
    }
}

/**
 * Get the owner of a bucket from the persistent store (Firestore)
 * @param {import('../env.js').Env} env - The environment
 * @param {*} bucketId - The bucket ID
 * @returns Promise<Object> - The bucket owner OR  null if it doesn't exist
 */
export async function getBucketOwner(env, bucketId) {
    // Get the Firestore client from the environment
    let client = env.firestore; 
    try {
        // Try and get the document from Firestore. Raise an error if it doesn't exist
        return await firestore.getDocument(client, bucketsCollection, bucketId, 'owner').then(doc => doc.fields.owner.stringValue);
    }
    catch (e) {
        return null;
    }
}
    