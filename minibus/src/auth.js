import {
	NoTokenError,
	ExpectedBasicStringError,
	NoValidTokenError,
} from './errors.js';

import { auth } from './lib/client/index.js';

// import { verifyBucketAccess } from './lib/firebase/db.js';

/**
 * Middleware: verify the request is authenticated with a valid JWT token.
 *
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withAuthToken(handler) {
	/**
	 * @param {Request} request
	 * @param {import('./env').Env} env
	 * @returns {Promise<Response>}
	 */
	return async (request, env, ctx) => {
		const token = getTokenFromRequest(request);
		if (!token) {
			throw new NoTokenError();
		}
		const user = await auth.signIn('a@a.a', 'aaaaaa');
		console.debug('user', user);
		// Split the token into an ID and a apiKey
		const [id, apiKey] = token.split(':');
		console.debug('id', id);
		console.debug('apiKey', apiKey);
		// Verify the token is valid
		const validation = await fetch(
			'http://127.0.0.1:5001/groundskeeper-18560/us-central1/verifyBucketAccess',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id, apiKey }),
			},
		);
		if (!validation.ok) {
			throw new NoValidTokenError();
		}
		// const validation = await verifyBucketAccess(id, apiKey);
		if (!validation) {
			throw new NoValidTokenError();
		}

		// Add the user ID to the request context
		return handler(request, env, { ...ctx, bucketId: id });
	};
}

function getTokenFromRequest(request) {
	const authHeader = request.headers.get('Authorization') || '';
	if (!authHeader) {
		throw new NoTokenError();
	}

	const token = parseAuthorizationHeader(authHeader);
	if (!token) {
		throw new NoTokenError();
	}
	return token;
}

function parseAuthorizationHeader(header) {
	if (!header.toLowerCase().startsWith('basic ')) {
		throw new ExpectedBasicStringError();
	}
	return header.substring(6);
}
