/* eslint-env serviceworker, browser */

import { base58btc } from 'multiformats/bases/base58';
import { sha256 } from 'multiformats/hashes/sha2';

import { MAX_BLOCK_SIZE } from '../constants.js';
import { JSONResponse } from '../utils/json-response.js';

import { BlockSizeInvalidError } from '../errors.js';

/**
 * @typedef {import('../env.js').Env} Env
 */


// TODO: Allow Configuration of CID version and multibase encoding
/**
 * Handle block post request
 *
 * @param {Request} request
 * @param {Env} env
 * @param {import('../index').Ctx} ctx -- gauranteed to have bucketId
 */
export async function blockPost(request, env, ctx) {
	const buffer = await request.arrayBuffer();
	const data = new Uint8Array(buffer);
	const bucketId = ctx.bucketId;

	if (data.byteLength >= MAX_BLOCK_SIZE) {
		throw new BlockSizeInvalidError();
	}

	// Get the digest of the data
	const digestResult = await sha256.digest(data);
	// Determine the multihash of the data
	const multihash = await base58btc.encode(digestResult.bytes);
	// Index by bucketId and multihash
	const key = `${bucketId}/${multihash}`;

	await env.BLOCKSTORE.put(key, data, {
		// TODO: Scope what Metadata to add
		customMetadata: {
			digestCode: String(sha256.code),
		},
	});

	return new JSONResponse({
		multihash: multihash, // base58btc encoded
	});
}
