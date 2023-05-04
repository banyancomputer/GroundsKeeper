import { globals } from './worker-globals.js';

export function createBearerToken() {
	return globals.BEARER_SECRET;
}

// TODO: Rename this to something more specific to your project.
export function createTestToken() {
	const token = globals.SECRET;
	return token;
}
