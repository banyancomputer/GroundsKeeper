/* eslint-env serviceworker */
import { Router } from 'itty-router';
import * as middleware from './middleware/index.js';
import { envAll } from './env.js';
import { errorHandler } from './errors.js';
import { versionGet } from './version.js';
import { blockPost, blockGet, blockHead } from './block/index.js';
import { bucketCreate } from './bucket/index.js';
import { bucketDelete } from './bucket/delete.js';

const router = Router();

const auth = {
	// Open routes
	'open': (handler) => middleware.cors.withCorsHeaders(handler),
	// Authenticated routes with Bearer token
	'bearer': (handler) => middleware.cors.withCorsHeaders(
		middleware.auth.withBearerAuth(handler)
	),
	'basic': (handler) => middleware.cors.withCorsHeaders(
		middleware.auth.withBasicAuth(handler)
	),
	// Authenticated routes with Bearer -> Basic token as fallback
	'fallback': (handler) => middleware.cors.withCorsHeaders(
		middleware.auth.withAuth(handler)
	),
};

router
	.all('*', envAll)
	.get('/version', auth['open'](versionGet))
	.post('/createBucket', auth['bearer'](bucketCreate))
	.post('/deleteBucket', auth['bearer'](bucketDelete))
	.post('/', auth['fallback'](blockPost))
	.get('/:multihash', auth['fallback'](blockGet))
	.head('/:multihash', auth['fallback'](blockHead));

/**
 * @param {Error} error
 * @param {Request} request
 * @param {import('./env').Env} env
 */
function serverError(error, request, env) {
	return middleware.cors.addCorsHeaders(request, errorHandler(error, env));
}

// https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent
/** @typedef {{ waitUntil(p: Promise): void }} Ctx */

export default {
	async fetch(request, env, ctx) {
		try {
			const res = await router.handle(request, env, ctx);
			env.log.timeEnd('request');
			return env.log.end(res);
		} catch (error) {
			if (env.log) {
				env.log.timeEnd('request');
				return env.log.end(serverError(error, request, env));
			}
			return serverError(error, request, env);
		}
	},
};
