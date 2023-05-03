import test from 'ava';
import { getMiniflare } from './scripts/utils.js';
import { createTestToken } from './scripts/helpers.js';

test.beforeEach(async (t) => {
	// Create a new Miniflare environment for each test
	t.context = {
		mf: getMiniflare(),
	};
});

test('Fails with 401 authentication when no token provided', async (t) => {
	const { mf } = t.context;

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
	});
	t.is(response.status, 401);
});

test('Fails with 401 authentication when invalid Header provided', async (t) => {
	const { mf } = t.context;
	const token = await createTestToken();

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `${token}` }, // Not Basic /token/
	});
	t.is(response.status, 401);
});

test('Fails with 401 authentication when invalid token provided', async (t) => {
	const { mf } = t.context;
	const token = 'token-with-no-secret';
	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Basic ${token}` }, // Invalid token
	});
	t.is(response.status, 401);
});

test('Fails with 403 authentication when invalid token provided', async (t) => {
	const { mf } = t.context;
	const token = 'invalid-token:with-a-secret';

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Basic ${token}` }, // Invalid token
	});
	t.is(response.status, 403);
});

test('Success with 200 authentication when valid token provided', async (t) => {
	const { mf } = t.context;
	const token = createTestToken();
	console.log(token);

	const response = await mf.dispatchFetch('https://localhost:8787', {
		method: 'POST',
		headers: { Authorization: `Basic ${token}` },
	});
	t.is(response.status, 200);
});
