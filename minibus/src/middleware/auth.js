import {
	NoAuthError,
	ExpectedBasicStringError,
	InvalidTokenError,
	AccessDeniedError,
	ExpectedBearerStringError
} from '../errors.js';
import { getBucketKey, getBucketOwner } from '../bucket/utils.js';
import { getUserKey } from '../user/get.js';
import { JSONResponse } from '../utils/json-response.js';

/**
 * General purpose auth handler. Attempts to parse the Authorization header as a Bearer token 
 * and then as a Basic token. If neither are successful, throws a NoAuthError
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withAuth(handler) {
	/**
	 * @param {Request} request
	 * @param {import('../env.js').Env} env
	 * @returns {Promise<Response>}
	 */
	return async (request, env, ctx) => {
		// Try and parse an auth header
		const authHeader = getAuthHeaderFromRequest(request);
		// First try and parse as a Bearer Auth header
		// If successful, continue with the handler
		try {
			parseBearerAuthHeader(authHeader);
			return withBearerAuth(handler)(request, env, ctx);
		} catch (e) {
			// If the error is not an ExpectedBearerStringError, rethrow
			if (!(e instanceof ExpectedBearerStringError)) {
				throw e;
			}
			// Next try and parse as a Basic Auth header
			return withBasicAuth(handler)(request, env, ctx);
		}
	};
}


// TODO: Look into how best to layer on bucket access control by naming
// TLDR, AWS s3 has regionally unique names, so you can implement creating a bucket as an
// idempotent operation. We don't have a concept of a region, so I have to stick with
// server generated ids -- which prolly means I have to use POST instead of PUT
/**
 * Check for valid Bearer Auth header - used for managing buckets
 * x-bucket-id header is optional, but should specify the bucket to operate on for management operations
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withBearerAuth(handler) {
	/**
	 * @param {Request} request
	 * @param {import('../env.js').Env} env
	 * @returns {Promise<Response>}
	 */
	return async (request, env, ctx) => {
		// Check for a Valid Header
		const authHeader = getAuthHeaderFromRequest(request);
		// Get the token from the Bearer Auth header
		const token = parseBearerAuthHeader(authHeader);
		// Get the userId and userKey from the token
		const [userId, userKey] = parseTokenString(token);
		// Validate access to a bucket
		await validateUserAccess(env, userId, userKey);
		// Attach the userId to the context
		ctx.userId = userId;

		// Try and get the bucketId from the request (if attached)
		const bucketId = getBucketIdFromRequest(request);
		// If the bucketId is attached in the headers, validate access to the bucket
		if (bucketId) {
			await validateUserIsBucketOwner(env, userId, bucketId);
			ctx.bucketId = bucketId;
		}

		return handler(request, env, { ...ctx, token });
	};
}

/**
 * Check for valid Basic Auth header for rad and write operations to buckets within the Blockstore
 * @param {import('itty-router').RouteHandler} handler
 * @returns {import('itty-router').RouteHandler}
 */
export function withBasicAuth(handler) {
	/**
	 * @param {Request} request
	 * @param {import('../env.js').Env} env
	 * @returns {Promise<Response>}
	 */
	return async (request, env, ctx) => {
		// Check for a Valid Header -- If not, throw a NoAuthError
		const authHeader = getAuthHeaderFromRequest(request);
		// Get the token from the Basic Auth header -- If not, throw an ExpectedBasicStringError
		const token = parseBasicAuthHeader(authHeader);
		// Get the id and key from the token -- If not, throw an InvalidTokenError
		const [bucketId, bucketKey] = parseTokenString(token);
		// Validate access to a bucket -- If not, throw an AccessDeniedError
		const t = await validateBucketAccess(env, bucketId, bucketKey);
		// return new JSONResponse({ bucketId, bucketKey, t });
		ctx.bucketId = bucketId;
		return handler(request, env, ctx);
	};
}

async function validateUserIsBucketOwner(env, userId, bucketId) {
	const owner = await getBucketOwner(env, bucketId);
	if (owner !== userId) {
		throw new AccessDeniedError();
	}
}

async function validateUserAccess(env, userId, userKey){
	// Read the user key from the user store
	const key = await getUserKey(env, userId);
	if (!key || key !== userKey) {
		// If the key is not found or does not match, throw an AccessDeniedError
		throw new AccessDeniedError();
	}
}

async function validateBucketAccess(env, bucketId, bucketKey){
	// Read the bucket key from the bucket store 
	const key = await getBucketKey(env, bucketId);
	if (!key || key !== bucketKey) {
		// If the key is not found or does not match, throw an AccessDeniedError
		throw new AccessDeniedError();
	}
	return key;
}

function getAuthHeaderFromRequest(request) {
	const authHeader = request.headers.get('Authorization') || null;
 	if (!authHeader) {
		throw new NoAuthError();
	}
	return authHeader;
}

function parseBasicAuthHeader(header) {
	if (!header.toLowerCase().startsWith('basic ')) {
		throw new ExpectedBasicStringError();
	}
	return header.substring(6);
}

function parseTokenString(token) {
	const [id, key] = token.split(':');
	if (!id || !key) {
		throw new InvalidTokenError();
	}
	return [id, key]
}

function parseBearerAuthHeader(header) {
	if (!header.toLowerCase().startsWith('bearer ')) {
		throw new ExpectedBearerStringError();
	}
	return header.substring(7);
}

function getBucketIdFromRequest(request) {
	return request.headers.get('x-bucket-id') || null;
}