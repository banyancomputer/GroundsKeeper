import { generateJWT } from '../utils/jwt.js';

/**
 * Firebase Client for interacting with the Firebase API.
 * Constructed from the workers Environment.
 * @class
 */
export default class FirebaseClient {
	/**
	 * Construct a new client. Initialize the Firebase Client to interact with a Firebase API
	 * @param {*} env - The workers environment. Should detail a Firebase Service Account.
	 * @param {*} apiUrl - The Firebase API URL
	 * @constructor
	 * @returns {FirebaseClient}
	 */
	constructor(serviceAccount, apiUrl) {
		const payload = {
			iss: serviceAccount.client_email,
			sub: serviceAccount.client_email,
			aud: apiUrl,
		};
		this.apiUrl = apiUrl;
		this.projectId = serviceAccount.project_id;
		this.payload = payload;
		this.key = serviceAccount.private_key;
		this.kid = serviceAccount.private_key_id;
		this.algorithm = 'RS256';
	}

	/**
	 * Generate the Authorization header for the Firebase API
	 * @returns {Object} - The Authorization header
	 * @async
	 */
	async authHeader() {
		let jwt = await generateJWT(
			this.payload,
			this.kid,
			this.key,
			this.algorithm
		);
		// What Firebase expects
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${jwt}`,
		};
	}

	/**
	 * Call a Firebase API endpoint
	 * @param {string} endpoint - The endpoint to call
	 * @param {Object} options - The options to pass to fetch
	 * @returns {Object} - The response from the Firebase API
	 * @async
	 */
	async call(endpoint, options) {
		return await fetch(`${this.apiUrl}/${endpoint}`, {
			...options,
			headers: await this.authHeader(),
		});
	}
}
