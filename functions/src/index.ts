import * as admin from "firebase-admin";
import * as functions from "firebase-functions";




// TODO: Authenticate the user
// import { auth, utils, types } from "./lib";
// import { utils, types } from "./lib";

// const BUCKET_ID_LENGTH = 32;
// const BUCKET_KEY_LENGTH = 32;

// const serviceAccount = require("../../serviceAccount.json");

// admin.initializeApp({
//     // Load creds from out service accoint json file
//     credential: admin.credential.cert(serviceAccount),
// }, 'test');


admin.initializeApp();

// Create

// /**
//  * Create a new bucket for the user
//  * @param data - the data passed to the function. Contains the bucket name
//  * @param context - the context passed to the function
//  * @returns the bucket id
//  * @throws invalid-argument if the bucket name is not provided
//  * @throws unauthenticated if the user is not authenticated
//  * @throws already-exists if a bucket by the same name already exists for the user
//  */
// // export const createBucket = functions.https.onCall(async (data, context) => {
//     console.log("createBucket called | data: %o | context: %o", data, context);
//     // Get the bucket name from the data
//     const { name } = data;
//     if (!name) {
//         throw new functions.https.HttpsError("invalid-argument", "Bucket name not provided");
//     }

//     // TODO: Authentication work here
//     const uid = context.auth?.uid ?? '' // await auth.authenticate(context);
//     if (!uid) {
//         throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
//     }

//     // Check if the bucket exists for the user
//     const bucketsRef = admin.firestore().collection("buckets");
//     const bucketQuery = await bucketsRef.where("name", "==", name).where("owner", "==", uid).get();
//     if (!bucketQuery.empty) {
//         throw new functions.https.HttpsError("already-exists", "Bucket already exists");
//     }

//     // Generate a new bucket id
//     const id = utils.generateRandomString(BUCKET_ID_LENGTH);

//     // TODO Check if the id is already in use in the database
//     const bucket: types.Bucket = {
//         id: id,
//         name: name,
//         owner: uid,
//         apiKey: utils.generateRandomString(BUCKET_KEY_LENGTH),
//         createdAt: new Date(),
//         updatedAt: new Date(),

//         rootCid: "",
//         rootKey: "",
//     };
//     // Write the bucket to the database
//     await bucketsRef.doc(id).set(bucket);
//     return bucket;
// });

function getTokenFromHeader(req: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return null;
    }
    return token;
  }

export const verifyJWT = functions.https.onRequest(async (request, response) => {
    console.log("verifyJWT called | request: %o", request.body);
    // Get the token from the request
    const token = getTokenFromHeader(request);
    if (!token) {
        throw new functions.https.HttpsError("invalid-argument", "Token not provided");
        response.status(400).send();
    }
    const decode = await admin.auth().verifyIdToken(token);
    console.log("decode: %o", decode);
    response.status(200).send();
});

// /**
//  * Verify access to a bucket with the API key
//  * @param request - the data passed to the function. Contains the bucket id and API key
//  * @returns a 200 response if the bucket exists and the API key is correct
//  * @throws invalid-argument if the bucket id or API key is not provided
//  */
// export const verifyBucketAccess = functions.https.onRequest(async (request, response) => {
//     console.log("verifyBucketAccess called | request: %o", request.body);
//     // Get the bucket id and API key from the request
//     const { id, apiKey } = request.body;
//     if (!id) {
//         throw new functions.https.HttpsError("invalid-argument", "Bucket Id not provided");
//         response.status(400).send();
//     }
//     if (!apiKey) {
//         throw new functions.https.HttpsError("invalid-argument", "API Key not provided");
        
//     }
//     // const apiKey = getTokenFromHeader(request);
//     // Check if the bucket exists
//     const bucketsRef = admin.firestore().collection("buckets");
//     const bucketQuery = await bucketsRef.where("id", "==", id).where("apiKey", "==", apiKey).get();
//     if (bucketQuery.empty) {
//         throw new functions.https.HttpsError("not-found", "Bucket not found");
//     }
//     response.status(200).send();
// });

// // Read 

// /**
//  * Get a bucket for the user if they are the owner
//  * @param data - the data passed to the function. Contains the bucket id
//  * @param context - the context passed to the function
//  * @returns the bucket document
//  * @throws invalid-argument if the bucket id is not provided
//  * @throws unauthenticated if the user is not authenticated
//  * @throws permission-denied if the user is not the owner of the bucket
//  */
// export const getBucket = functions.https.onCall(async (data, context) => {
//     console.log("getBucket called | data: %o | context: %o", data, context);
//     // Get the bucket id from the data
//     const { id } = data;
//     if (!id) {
//         throw new functions.https.HttpsError("invalid-argument", "Bucket Id not provided");
//     }
    
//     //TODO: Authentication work here
//     const uid = context.auth?.uid ?? '' // await auth.authenticate(context);
//     if (!uid) {
//         throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
//     }
    
//     // Get the bucket document -- if the user is the owner
//     const bucketRef = admin.firestore().collection("buckets").doc(id);
//     // Return the document 
//     const bucketDoc = await bucketRef.get();
//     if (!bucketDoc.exists) {
//         throw new functions.https.HttpsError("not-found", "Bucket not found");
//     }
//     const bucket = bucketDoc.data() as types.Bucket;
//     if (bucket.owner !== uid) {
//         throw new functions.https.HttpsError("permission-denied", "User is not the owner of the bucket");
//     }
//     return bucket;
// });

// export const getBucketByName = functions.https.onCall(async (data, context) => {
//     console.log("getBucketByName called | data: %o | context: %o", data, context);
//     // Get the bucket name from the data
//     const { name } = data;
//     if (!name) {
//         throw new functions.https.HttpsError("invalid-argument", "Bucket name not provided");
//     }
//     // TODO Authentication work here
//     const uid = context.auth?.uid ?? '' // await auth.authenticate(context);
//     if (!uid) {
//         throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
//     }
//     // Get the bucket document -- if the user is the owner
//     const bucketRef = admin.firestore().collection("buckets").where("name", "==", name).where("owner", "==", uid);
//     // Check for an empty query
//     const bucketQuery = await bucketRef.get();
//     if (bucketQuery.empty) {
//         throw new functions.https.HttpsError("not-found", "Bucket not found");
//     }
//     // Return the document
//     const bucketDoc = bucketQuery.docs[0];
//     const bucket = bucketDoc.data() as types.Bucket;
//     return bucket;
// });
    
// // Update

// /**
//  * Set a rootKey for the bucket
//  * @param data - the data passed to the function. Contains the bucket id and the rootKey
//  * @param context - the context passed to the function
//  * @returns
//  * @throws invalid-argument if the bucket id or rootKey is not provided
//  * @throws unauthenticated if the user is not authenticated
//  * @throws permission-denied if the user is not the owner of the bucket
//  * @throws not-found if the bucket does not exist for the user
//  * @throws already-exists if the bucket already has a rootKey
//  */
// export const setBucketRootKey = functions.https.onCall(async (data, context) => {
//     console.log("setBucketRootKey called | data: %o | context: %o", data, context);
//     // Get the bucket id and rootKey from the data
//     const { id, rootKey } = data;
//     if (!id) {
//         throw new functions.https.HttpsError("invalid-argument", "Bucket Id not provided");
//     }
//     if (!rootKey) {
//         throw new functions.https.HttpsError("invalid-argument", "Root Key not provided");
//     }

//     // TODO: Authentication work here
//     const uid = context.auth?.uid ?? '' // await auth.authenticate(context);
//     if (!uid) {
//         throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
//     }

//     // Check if the bucket exists for the user
//     const bucketRef = admin.firestore().collection("buckets").doc(id);
//     const bucketDoc = await bucketRef.get();
//     if (!bucketDoc.exists) {
//         throw new functions.https.HttpsError("not-found", "Bucket not found");
//     }
//     const bucket = bucketDoc.data() as types.Bucket;
//     if (bucket.owner !== uid) {
//         throw new functions.https.HttpsError("permission-denied", "User is not the owner of the bucket");
//     }
//     if (bucket.rootKey !== "") {
//         throw new functions.https.HttpsError("already-exists", "Bucket already has a rootKey");
//     }

//     // Update the bucket
//     await bucketRef.update({
//         rootKey: rootKey,
//         updatedAt: new Date(),
//     });
//     return;
// });




// // Delete

// /**
//  * Delete a bucket for the user
//  * @param data - the data passed to the function. Contains the bucket id
//  * @param context - the context passed to the function
//  * @returns the bucket id
//  * @throws invalid-argument if the bucket id is not provided
//  * @throws unauthenticated if the user is not authenticated
//  * @throws not-found if the bucket does not exist for the user
//  */
// export const removeBucket = functions.https.onCall(async (data, context) => {
//     // Get the id from the data
//     const { id } = data;
//     if (!id) {
//         throw new functions.https.HttpsError("invalid-argument", "Bucket Id not provided");
//     }

//     // TODO: Authentication work here
//     const uid = context.auth?.uid // await auth.authenticate(context);
//     if (!uid) {
//         throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
//     }

//     // Check if the bucket exists for the user
//     const bucketRef = admin.firestore().collection("buckets").doc(bucketId);
//     const bucketDoc = await bucketRef.get();
//     if (!bucketDoc.exists) {
//         throw new functions.https.HttpsError("not-found", "Bucket not found");
//     }

//     // Delete the bucket
//     await bucketRef.delete();
//     return bucketId;
// });

// /**
//  * Set a new bucket key for the user -- overwrites the old key!
//  * @param data - the data passed to the function. Contains the bucket id
//  * @param context - the context passed to the function
//  * @returns the new bucket key
//  */
// export const createBucketKey = functions.https.onCall(async (data, context) => {
//     // Get the bucket name from the data
//     const { bucketId } = data;
//     if (!bucketId) {
//         throw new functions.https.HttpsError("invalid-argument", "Bucket Id not provided");
//     }
//     // TODO: Authentication work here
//     const uid =  context.auth?.uid // await auth.authenticate(context);
//     if (!uid) {
//         throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
//     }
//     // Check if the bucket exists for the user
//     const bucketRef = admin.firestore().collection("buckets").doc(bucketId);
//     const bucketDoc = await bucketRef.get();
//     if (bucketDoc.exists) {
//         const bucket = bucketDoc.data() as types.Bucket;
//         if (bucket.owner !== uid) {
//             throw new functions.https.HttpsError("permission-denied", "User does not own bucket");
//         }
//     }
//     else {
//         throw new functions.https.HttpsError("not-found", "Bucket not found");
//     }
//     // Create the bucket key
//     const bucketKey = utils.generateRandomString(BUCKET_KEY_LENGTH);
//     await bucketRef.update({
//         key: bucketKey,
//         updatedAt: new Date(),
//     });
// });



