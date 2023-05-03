import {
	NoTokenError,
	ExpectedBasicStringError,
	NoValidTokenError,
	InvalidTokenError,
} from './errors.js';
import { FirebaseClient, firestore } from './firebase/index.js';
import { JSONResponse } from './utils/json-response.js';
/**
 * Middleware: verify the request is authenticated with valid Credentials
 * for API access to a bucket.
 * Credentials should be in:
 * - `Authorization: Basic {bucketId}:{bucketKey}` header
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
		// Check for a valid token
		const token = getTokenFromRequest(request);
		const [bucketId, bucketKey] = token.split(':');
		if (!bucketId || !bucketKey) {
			throw new NoValidTokenError();
		}
		// Create a new Firesore client
		let fsClient = new FirebaseClient(
			env.FIREBASE_SERVICE_ACCOUNT,
			env.FIRESTORE_API_URL
		);
		const validToken = await veryifyBucketKey(fsClient, bucketId, bucketKey);
		if (!validToken) {
			throw new InvalidTokenError();
		}
		// Add the user ID to the request context
		return handler(request, env, ctx);
	};
}

async function veryifyBucketKey(fsClient, bucketId, bucketKey) {
	// Get the bucket document from Firestore
	const bucket = await firestore.getDocument(fsClient, 'buckets', bucketId);
	return bucket && bucket.fields.key.stringValue === bucketKey;
}

// TODO: Do we need all this Error handling?
function getTokenFromRequest(request) {
	const authHeader = request.headers.get('Authorization') || '';
	if (!authHeader) {
		throw new NoTokenError();
	}

	let token = parseBasicAuthorizationHeader(authHeader);
	if (!token) {
		// TODO: Implement Bearer token auth for Bucket creation
		// token = parseBearerAuthorizationHeader(authHeader);
		throw new NoTokenError();
	}
	return token;
}

function parseBasicAuthorizationHeader(header) {
	if (!header.toLowerCase().startsWith('basic ')) {
		throw new ExpectedBasicStringError();
	}
	return header.substring(6);
}

// function parseBearerAuthorizationHeader(header) {
// 	if (!header.toLowerCase().startsWith('bearer ')) {
// 		throw new ExpectedBearerStringError();
// 	}
// 	return header.substring(7);
// }
