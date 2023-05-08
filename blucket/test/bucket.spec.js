import test from 'ava';
import { getMiniflare } from './scripts/utils.js';
import { createTestToken, createBearerToken } from './scripts/helpers.js';
import { Blob } from '@web-std/fetch';
test.beforeEach(async (t) => {
	const token = await createTestToken();
	// Create a new Miniflare environment for each test
	t.context = {
		mf: getMiniflare(),
		token,
	};
});

test('Can create and delete new bucket', async (t) => {
	const { mf } = t.context;
    const token = createBearerToken();
    const bucketName = 'my-bucket';
	// const data = JSON.stringify({ name: bucketName });
    // const data = JSON.stringify({ hello: 'world' });
	// const postBlob = new Blob([data]);

	const postResponse = await mf.dispatchFetch('https://localhost:8787/createBucket', {
		method: 'POST',
		body: JSON.stringify({ name: bucketName }),
        // Remember, this is a bearer token, not a basic token!
		headers: { Authorization: `Bearer ${token}` },
	});
	const blockPostResult = await postResponse.json();
	t.truthy(blockPostResult.bucketId);
    t.truthy(blockPostResult.key);

    const deleteResponse = await mf.dispatchFetch('https://localhost:8787/deleteBucket', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'x-bucket-id': blockPostResult.bucketId },
    });
    const deleteResult = await deleteResponse.json();
    t.is(deleteResult.bucketId, blockPostResult.bucketId);
});