import middy from '@middy/core';
import { sendResponse } from '../../../utils/sendResponse.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { getPost } from '../../../services/posts.mjs';

const getOnePost = async (event) => {
    const postId = event.pathParameters.postId;

    const post = await getPost(postId);

    return sendResponse(200, post);
};

export const handler = middy(getOnePost)
    .use(errorHandler());