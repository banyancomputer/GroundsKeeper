const testFunctions = require('firebase-functions-test')({
    projectId: 'groundskeeper-18560',
});
const admin = require('firebase-admin');
const test = require('ava');
const { createBucket, verifyBucketAccess } = require('../lib/index.js');

const projectId = 'groundskeeper-18560';
const testApiKey = 'test-api-key';

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: projectId,
        credential: admin.credential.applicationDefault(),
    });
}

// TODO: Integration test + Authentication
test.before(async (t) => {
    const user = { email: 'user@example.com', uid: 'user123' };
    await admin.auth().createUser(user);
    t.context = {
        user: user,
    };
});

test.after(async (t) => {
    testFunctions.cleanup();
    await admin.auth().deleteUser(t.context.user.uid);
});

test('Create a new Bucket for a user', async (t) => {
    const { user } = t.context;
    const bucketName = 'test-bucket';
    const context = { auth: { uid: user.uid } }; // , token: token } };
    const data = { name: bucketName };
    const wrap = testFunctions.wrap(createBucket);
    const response = await wrap(data, context);

    console.log(response);
    // Check if the Bucket was created correctly
    t.is(response.name, bucketName);
    t.is(response.owner, user.uid);

    // Set a new apiKey on the bucket in firestore -- downstream tests will use this

    // // Call verifyBucketAccess -- it's an onRequest function, so we need to wrap it
    // const request = {
    //     body: {
    //         bucket: response.id,
    //         authorization: `Bearer ${testApiKey}`,
    //     },
    // };
    // fetch(
    //     'http://localhost:5001/groundskeeper-18560/us-central1/verifyBucketAccess',
    //     {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(request),
    //     }
    // ).then((res) => {
    //     t.is(res.status, 200);
    //     t.is(res.body, 'OK');
    // }
    // );
});