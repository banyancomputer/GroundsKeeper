import fs from 'fs';
import path from 'path';
import { Miniflare } from 'miniflare';

export function getMiniflare() {
	return new Miniflare({
		// envPath,
		scriptPath: 'dist/worker.mjs',
		port: 8788,
		packagePath: true,
		wranglerConfigPath: true,
		// We don't want to rebuild our worker for each test, we're already doing
		// it once before we run all tests in package.json, so disable it here.
		// This will override the option in wrangler.toml.
		buildCommand: undefined,
		wranglerConfigEnv: 'test',
		modules: true,
		r2Buckets: ['BLOCKSTORE'],
		// bindings: {
		// 	...globals,
		// },
	});
}
