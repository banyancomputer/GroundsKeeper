import { globals } from './worker-globals.js';

export function createTestToken() {
	const token = globals.SECRET;
	return token;
}
