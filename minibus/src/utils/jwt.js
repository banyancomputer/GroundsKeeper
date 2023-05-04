import jose from 'node-jose';

/**
 * generateJWT - generates a JWT for the service account
 * @param {*} payload - the payload to sign. Specifies an iss, sub, and aud.
 * @param {*} kid - the kid of the private key
 * @param {*} key - the private key file contents -- formatted as string with \n characters
 * @param {*} algorithm - the algorithm to use
 * @returns
 */
export const generateJWT = async (payload, kid, key, algorithm) => {
	const iat = new Date().getTime() / 1000;
	payload = {
		...payload,
		iat: iat,
		exp: iat + 3600,
	};

	const signingKey = await jose.JWK.asKey(key.replace(/\\n/g, '\n'), 'pem');

	const sign = await jose.JWS.createSign(
		{ fields: { alg: algorithm, kid: kid } },
		signingKey
	)
		.update(JSON.stringify(payload), 'utf8')
		.final();

	const signature = sign.signatures[0];
	return [signature.protected, sign.payload, signature.signature].join('.');
};

/**
 * TODO: What stuff do I need to check?
 * verifyJWT - verifies whether a JWT is valid
 * @param {*} jwt - the JWT to verify
 * @param {*} key - the public key file contents -- formatted as string with \n characters
 * @returns
 */
export const verifyJWT = async (jwt, key) => {
	const publicKey = await jose.JWK.asKey(key.replace(/\\n/g, '\n'), 'pem');
	const verify = await jose.JWS.createVerify(publicKey).verify(jwt);
	return verify;
}
