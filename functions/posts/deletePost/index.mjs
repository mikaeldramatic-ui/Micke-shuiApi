import middy from '@middy/core';
import { sendResponse } from '../../../utils/sendResponse.mjs';
import { authenticate } from '../../../middlewares/authenticate.mjs';
import { authorize } from '../../../middlewares/authorize.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { removePost } from '../../../services/posts.mjs';

const deleteOnePost = async (event) => {
    const { postId } = event.pathParameters;

    await removePost(postId);

    return sendResponse(204);
};

export const handler = middy(deleteOnePost)
    .use(authenticate())
    .use(authorize())
    .use(errorHandler());