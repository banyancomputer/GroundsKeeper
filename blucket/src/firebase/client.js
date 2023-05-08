import { generateJWT } from '../utils/jwt.js';
import { FirebaseError } from '../errors.js';

/**
 * Firebase Client for interacting with the Firebase API.
 * Constructed from the workers Environment.
 * @class
 */
export default class FirebaseClient {
	/**
	 * Construct a new client. Initialize the Firebase Client to interact with a Firebase API
	 * @param {*} env - The workers environment. Should detail a Firebase Service Account as a Text Blob
	 * @param {*} apiUrl - The Firebase API URL
	 * @constructor
	 * @returns {FirebaseClient}
	 */
	constructor(serviceAccountBlob, apiUrl) {
		const serviceAccount = JSON.parse(serviceAccountBlob);
		const payload = {
			iss: serviceAccount.client_email,
			// sub: serviceAccount.client_email,
			sub: 'test@user.com',
			aud: apiUrl,
		};
		this.projectId = serviceAccount.project_id;
		this.payload = payload;
		this.key = serviceAccount.private_key;
		this.kid = serviceAccount.private_key_id;
		this.algorithm = 'RS256';
	}

	/**
	 * Print the Firebase Client
	 */
	json() {
		return JSON.stringify(this);
	}

	/**
	 * TODO: Try and store and read these from the KV store
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
		// return`${this.aud}/${endpoint}` 
		return await fetch(`${this.payload.aud}/${endpoint}`, {
			...options,
			headers: await this.authHeader(),
		}).catch((error) => {
			throw new FirebaseError(error);
		});
	}
}
