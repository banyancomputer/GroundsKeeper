import { JSONResponse } from './utils/json-response.js';

// TODO: Refactor into a new directory

/**
 * Our Error handler
 * @param {Error & {status?: number;code?: string; contentType?: string;}} err
 * @param {import('./env').Env} env
 */
export function errorHandler(err, env) {
	console.error(err.stack);
	const status = err.status || 500;
	if (env.sentry && status >= 500) {
		env.log.error(err);
	}
	return new JSONResponse(err.message || 'Server Error', { status });
}

/**
 * Basic HTTP Error
 * @extends Error
 * @property {number} status
 * @property {string} code
 */
export class HTTPError extends Error {
	constructor(message, status = 500) {
		super(message);
		this.name = 'HTTPError';
		this.status = status;
	}
}

/* Authentication errors */

/**
 * No Authorization header provided
 */
export class NoAuthError extends HTTPError {
	constructor(msg = 'No Authorization header provided') {
		super(msg, 401);
		this.name = 'NoToken';
		this.code = NoAuthError.CODE;
	}
}
NoAuthError.CODE = 'ERROR_NO_AUTH';

/**
 * When the Authorization header is not in the `Basic {token}` format, but expected to be
 */
export class ExpectedBasicStringError extends HTTPError {
	constructor(
		msg = 'Expected argument to be a string in the `Basic {token}` format'
	) {
		super(msg, 401);
		this.name = 'ExpectedBasicString';
		this.code = ExpectedBasicStringError.CODE;
	}
}
ExpectedBasicStringError.CODE = 'ERROR_EXPECTED_BASIC_STRING';

/**
 * When the Authorization header is not in the `Bearer {token}` format, but expected to be
 */
export class ExpectedBearerStringError extends HTTPError {
	constructor(
		msg = 'Expected argument to be a string in the `Bearer {token}` format'
	) {
		super(msg, 401);
		this.name = 'ExpectedBearerString';
		this.code = ExpectedBearerStringError.CODE;
	}
}
ExpectedBearerStringError.CODE = 'ERROR_EXPECTED_BEARER_STRING';

/**
 * The authorization header is in the correct format for the requested resource, but the token is invalid or badly formatted
 */
export class InvalidTokenError extends HTTPError {
	constructor(msg = 'Provided token is invalid') {
		super(msg, 401);
		this.name = 'NoValidToken';
		this.code = InvalidTokenError.CODE;
	}
}
InvalidTokenError.CODE = 'ERROR_INVALID_AUTH_TOKEN';

/**
 * The authorization header is in the correct format for the requested resource, the token specified is valid, 
 * but the token is not authorized to access the requested resourcess
 */
export class AccessDeniedError extends HTTPError {
	constructor(msg = 'Provided token is invalid') {
		super(msg, 403);
		this.name = 'InvalidToken';
		this.code = AccessDeniedError.CODE;
	}
}
AccessDeniedError.CODE = 'ERROR_ACCESS_DENIED';


/* Block errors */

/**
 * When the block is not found
 */
export class BlockNotFoundError extends HTTPError {
	constructor(msg = 'Requested block not found') {
		super(msg, 404);
		this.name = 'BlockNotFound';
		this.code = BlockNotFoundError.CODE;
	}
}
BlockNotFoundError.CODE = 'ERROR_BLOCK_NOT_FOUND';

/**
 * When a block is posted, but the block size is invalid
 */
export class BlockSizeInvalidError extends HTTPError {
	constructor(msg = 'Provided block has invalid size') {
		super(msg, 400);
		this.name = 'BlockSizeInvalid';
		this.code = BlockSizeInvalidError.CODE;
	}
}
BlockSizeInvalidError.CODE = 'ERROR_BLOCK_SIZE_INVALID';

/* Base errors (TODO: What is a base?) */

/**
 * When the base is not found
 */
export class BaseNotFoundError extends HTTPError {
	constructor(msg = 'Provided encoded base not found') {
		super(msg, 400);
		this.name = 'BaseNotFound';
		this.code = BaseNotFoundError.CODE;
	}
}
BaseNotFoundError.CODE = 'ERROR_BASE_NOT_FOUND';

/* Bucket API errors */

/**
 * When there's an issue with creating a bucket
 */
export class BucketCreateError extends HTTPError {
	constructor(msg = 'Failed to create bucket') {
		super(msg, 500);
		this.name = 'BucketCreateError';
		this.code = BucketCreateError.CODE;
	}
}
BucketCreateError.CODE = 'ERROR_BUCKET_CREATE';

/* Firebase errors */

/**
 * When there's an issue internally in making a request to Firebase.
 */
export class FirebaseError extends HTTPError {
	// TODO: Less wimpier error message
	constructor(msg = 'Internal error in Firebase') {
		super(msg, 500);
		this.name = 'FirebaseError';
		this.code = FirebaseError.CODE;
	}
}
FirebaseError.CODE = 'ERROR_FIREBASE';

/**
 * When non-existent data is requested from Firestore
 */
export class FirestoreNotFoundError extends HTTPError {
	constructor(msg = 'Requested data not found in Firestore') {
		super(msg, 404);
		this.name = 'FirestoreNotFound';
		this.code = FirestoreNotFoundError.CODE;
	}
}
FirestoreNotFoundError.CODE = 'ERROR_FIRESTORE_NOT_FOUND';

/**
 * When a call to create data in Firestore fails
 */
export class FirestoreCreateError extends HTTPError {
	constructor(msg = 'Failed to create data in Firestore') {
		super(msg, 500);
		this.name = 'FirestoreCreateError';
		this.code = FirestoreCreateError.CODE;
	}
}
FirestoreCreateError.CODE = 'ERROR_FIRESTORE_CREATE';

/**
 * When a call to update data in Firestore fails
 */
export class FirestoreUpdateError extends HTTPError {
	constructor(msg = 'Failed to update data in Firestore') {
		super(msg, 500);
		this.name = 'FirestoreUpdateError';
		this.code = FirestoreUpdateError.CODE;
	}
}