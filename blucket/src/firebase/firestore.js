import { FirestoreNotFoundError, FirestoreCreateError } from "../errors";

/**
 * Get the api route for the given project and API version
 * @param {string} projectId - The project ID
 * @param {string} apiVersion - The API version
 * @returns {string} - The API route
 */
const firestoreApiRoute = (projectId, apiVersion) => {
	switch (apiVersion) {
		default:
			return `v1/projects/${projectId}/databases/(default)/documents`;
	}
};

// /**
//  * Put a document in a firestore collection
//  * @param {string} collection - The collection to put the document in
//  * @param {string} document - The document to put in the collection
//  * @param {Object} data - The data to put in the document
//  * @returns {Object} - The response from the Firebase API
//  * @async
//  */
// export async function putDocument(firestoreClient, collection, document, data) {
// 	const endpoint = `${firestoreApiRoute(
// 		firestoreClient.projectId,
// 		firestoreClient.apiVersion
// 	)}/${collection}/${document}`;
// 	return await firestoreClient.call(endpoint, {
// 		method: 'PATCH',
// 		body: JSON.stringify({
// 			fields: data,
// 		}),
// 	});
// }

/**
 * Create a document in a firestore collection
 * @param {string} collection - The collection to create the document in
 * @param {string} document - The document to create in the collection
 * @param {Object} data - The data to put in the document
 * @param {string} mask - The mask to apply to the document. Should only be a single field
 * @returns {Object} - The response from the Firebase API
 * @async
 */
export async function createDocument(firestoreClient, collection, data) {
	const endpoint = `${firestoreApiRoute(
		firestoreClient.projectId,
		firestoreClient.apiVersion
	)}/${collection}`;
	return await firestoreClient
		.call(endpoint, {
			method: 'POST',
			body: JSON.stringify({
				fields: data,
			}),
		})
		.then((response) => {
			let json = response.json();
			if (response.status == 200) {
				return json;
			}
			throw new FirestoreCreateError();
		});
}

/**
 * Get a document from a firestore collection
 * @param {string} collection - The collection to get the document from
 * @param {string} document - The document to get from the collection
 * @param {string} mask - The mask to apply to the document. Should only be a single field
 * @returns {Object} - The response from the Firebase API. Null if the document does not exist.
 * @async
 */
export async function getDocument(firestoreClient, collection, document, mask) {
	const endpoint = `${firestoreApiRoute(
		firestoreClient.projectId,
		firestoreClient.apiVersion
	)}/${collection}/${document}?${mask ? 'mask.fieldPaths=' + mask : ''}`;
	return await firestoreClient
		.call(endpoint, {
			method: 'GET',
		})
		.then((response) => {
			let json = response.json();
			if (response.status == 200) {
				return json;
			}
			throw new FirestoreNotFoundError();
		})
}

/**
 * Delete a document from a firestore collection
 * @param {string} collection - The collection to delete the document from
 * @param {string} document - The document to delete from the collection
 * @returns {Object} - The response from the Firebase API
 * @async
 */
export async function deleteDocument(firestoreClient, collection, document) {
	const endpoint = `${firestoreApiRoute(
		firestoreClient.projectId,
		firestoreClient.apiVersion
	)}/${collection}/${document}`;
	return await firestoreClient
		.call(endpoint, {
			method: 'DELETE',
		})
		.then((response) => {
			let json = response.json();
			if (response.status == 200) {
				return json;
			}
			throw new FirestoreNotFoundError();
		});
}


// /**
//  * Update a document in a firestore collection
//  * @param {string} collection - The collection to update the document in
//  * @param {string} document - The document to update in the collection
//  * @param {Object} data - The data to update in the document
//  * @returns {Object} - The response from the Firebase API
//  * @async
//  * @throws {Error} - If the document does not exist
//  */
// export async function updateDocument(firestoreClient, collection, document, data) {
// 	const endpoint = `${firestoreApiRoute(
// 		firestoreClient.projectId,
// 		firestoreClient.apiVersion
// 	)}/${collection}/${document}`;
// 	return await firestoreClient
// 		.call(endpoint, {
// 			method: 'PATCH',
// 			body: JSON.stringify({
// 				fields: data,
// 			}),
// 		}).then((response) => {
// 			let json = response.json();
// 			if (response.status == 200) {
// 				return json;
// 			}
// 			throw new FirestoreNotFoundError();
// 		})
// }
