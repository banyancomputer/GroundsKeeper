import randKey from "../utils/randKey";
import { createBucket } from "./utils";
import { FirestoreCreateError } from "../errors";
import { JSONResponse } from "../utils/json-response";
import { FirebaseClient } from "../firebase";


/**
 * TODO: Rename and organize by method
 * Handle create bucket request
 * Creates a bucket with a random Id and a key.
 * Names it according to the request body.
 * Owns it according the calling user.
 * @param {Request} request - 
 * @param {Env} env
 * @param {import('../index').Ctx} -- gaurenteed to have userId
 */
export async function bucketCreate(request, env, ctx) {
    const owner = ctx.userId;
    const data = await request.json()
    const name = data.name;
    const key = randKey(32);

    return await createBucket(env, owner, name, key).then((bucketId) => {
        return new JSONResponse({
            bucketId: bucketId,
            key: key
        });
    }).catch((err) => {
        throw new FirestoreCreateError(err);
    });
}