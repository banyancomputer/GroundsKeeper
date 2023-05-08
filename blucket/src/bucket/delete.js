import randKey from "../utils/randKey";
import { deleteBucket } from "./utils";
import { FirestoreCreateError } from "../errors";
import { JSONResponse } from "../utils/json-response";

/**
 * TODO: Rename and organize by method
 * Handle create bucket request
 * Creates a bucket with a random Id and a key.
 * Names it according to the request body.
 * Owns it according the calling user.
 * @param {Request} request - 
 * @param {Env} env
 * @param {import('../index').Ctx} -- gaurenteed to have bucketId
 */
export async function bucketDelete(request, env, ctx) {
    const bucketId = ctx.bucketId;

    return await deleteBucket(env, bucketId).then(() => {
        return new JSONResponse({
            bucketId: bucketId,
        });
    });
}