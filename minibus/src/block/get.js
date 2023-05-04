/* eslint-env serviceworker, browser */
/* global Response */

import { getMultihashFromCidValue, toBase58btc } from './utils.js';
import { BlockNotFoundError } from '../errors.js';

/**
 * @typedef {import('../env').Env} Env
 */

/**
 * Handle block get request
 *
 * @param {Request} request
 * @param {Env} env
 * @param {import('../index').Ctx} ctx - gauranteed to have bucketId
 */
export async function blockGet(request, env, ctx) {
	// Get cached block if exists -- don't permission this for now
	// How do we want to handle caching? How does formatting requests affect caching?
	// Does it check if this exact request has been made before? Is this a problem to persist?
	const cache = caches.default;
	let res = await cache.match(request);
	if (res) {
		return res;
	}

	const bucketId = ctx.bucketId;
	const multihashOrCid = request.params.multihash;

	// Permanently redirect to multihash if cid provided
	// Note that CIDv0 and multihash encoded as b58btc will be the same
	const multihashByCidValue = getMultihashFromCidValue(multihashOrCid);
	if (multihashByCidValue && multihashByCidValue !== multihashOrCid) {
		return Response.redirect(
			request.url.replace(multihashOrCid, multihashByCidValue),
			301
		);
	}

	const multihash = await toBase58btc(multihashOrCid, env.bases);
	const key = `${bucketId}/${multihash}`;

	const r2Object = await env.BLOCKSTORE.get(key);
	if (r2Object) {
		res = new Response(r2Object.body, {
			headers: {
				'Cache-Control': 'immutable',
			},
		});

		// Store in cache
		ctx.waitUntil(cache.put(request, res.clone()));

		return res;
	}

	throw new BlockNotFoundError();
}
