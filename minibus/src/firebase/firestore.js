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

/**
 * Put a document in a firestore collection
 * @param {string} collection - The collection to put the document in
 * @param {string} document - The document to put in the collection
 * @param {Object} data - The data to put in the document
 * @returns {Object} - The response from the Firebase API
 * @async
 */
export async function putDocument(firestoreClient, collection, document, data) {
	const endpoint = `${firestoreApiRoute(
		firestoreClient.projectId,
		firestoreClient.apiVersion
	)}/${collection}/${document}`;
	return await firestoreClient.call(endpoint, {
		method: 'PATCH',
		body: JSON.stringify({
			fields: data,
		}),
	});
}

/**
 * Get a document from a firestore collection
 * @param {string} collection - The collection to get the document from
 * @param {string} document - The document to get from the collection
 * @returns {Object} - The response from the Firebase API. Null if the document does not exist.
 * @async
 */
export async function getDocument(firestoreClient, collection, document) {
	const endpoint = `${firestoreApiRoute(
		firestoreClient.projectId,
		firestoreClient.apiVersion
	)}/${collection}/${document}`;
	return await firestoreClient
		.call(endpoint, {
			method: 'GET',
		})
		.then((response) => {
			let json = response.json();
			if (response.status == 200) {
				return json;
			}
			return null;
		})
		.catch((error) => {
			return null;
		});
}
