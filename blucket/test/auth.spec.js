import test from 'ava';
import { getMiniflare } from './scripts/utils.js';
import { createBearerToken, createTestToken } from './scripts/helpers.js';
// import { globals } from './scripts/worker-globals.js';

test.beforeEach(async (t) => {
	// Create a new Miniflare environment for each test
	t.context = {
		mf: getMiniflare(),
	};
	const binding = await t.context.mf.getBindings();
	console.log('globals', binding);
});

test('Fails with 401 authentication when no Auth Header provided', async (t) => {
	const { mf } = t.context;

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
	});
	t.is(response.status, 401);
});

test('Fails with 401 authentication when invalid Auth Header provided', async (t) => {
	const { mf } = t.context;
	const token = await createTestToken();

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `${token}` }, // Not Basic or Bearer /token/
	});
	t.is(response.status, 401);
});

test('Fails with 401 authentication when invalid token provided to Bearer Auth', async (t) => {
	const { mf } = t.context;
	const token = 'token-with-no-secret';
	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` }, // Invalid token
	});
	t.is(response.status, 401);
});

test('Fails with 401 authentication when invalid token provided to Basic Auth', async (t) => {
	const { mf } = t.context;
	const token = 'token-with-no-secret';
	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Basic ${token}` }, // Invalid token
	});
	t.is(response.status, 401);
});

test('Fails with 403 authentication when unauthed nopn-extant token provided to Bearer Auth', async (t) => {
	const { mf } = t.context;
	const token = 'fake-user:invalid-secret';
	
	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` }, // Unauthed token
	});
	t.is(response.status, 403);
});


test('Fails with 403 authentication when non-extant token provided to Basic Auth', async (t) => {
	const { mf } = t.context;
	const token = `fake-bucket:invalid-secret`;

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Basic ${token}` }, // Unauthed token
	});
	t.is(response.status, 403);
});

test('Fails with 403 authentication when unauthed token provided to Bearer Auth', async (t) => {
	const { mf } = t.context;
	const goodToken = createTestToken();
	const userId = goodToken.split(':')[0];
	const token = `${userId}:invalid-secret`;

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` }, // Unauthed token
	});
	t.is(response.status, 403);
});

test('Fails with 403 authentication when unauthed token provided to Basic Auth', async (t) => {
	const { mf } = t.context;
	const goodToken = createTestToken();
	const bucketId = goodToken.split(':')[0];
	const token = `${bucketId}:invalid-secret`;

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Basic ${token}` }, // Unauthed token
	});
	t.is(response.status, 403);
});

test('Success with 200 authentication when valid token provided to Bearer Auth', async (t) => {
	const { mf } = t.context;
	const token = createBearerToken();

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
	});

	t.is(response.status, 200);
});

test('Success with 200 authentication when valid token provided to Bearer Auth, but unauthed bucketId', async (t) => {
	const { mf } = t.context;
	const token = createBearerToken();
	const bucketId = 'fake-bucket';

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'x-bucket-id': bucketId },
	});
	t.is(response.status, 403);
});

test('Success with 200 authentication when valid token provided to Bearer Auth, and good bucketId', async (t) => {
	const { mf } = t.context;
	const token = createBearerToken();
	const bucketId = createTestToken().split(':')[0];

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'x-bucket-id': bucketId },
	});
	t.is(response.status, 200);
});

test('Success with 200 authentication when valid token provided to Basic Auth', async (t) => {
	const { mf } = t.context;
	const token = createTestToken();

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Basic ${token}` },
	})

	t.is(response.status, 200);
});
