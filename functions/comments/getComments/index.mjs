import middy from '@middy/core';
import { sendResponse } from '../../../utils/sendResponse.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { getComments } from '../../../services/comments.mjs';

const getPostComments = async (event) => {
    
    const postId = event.pathParameters.postId;

    const comments = await getComments(postId);

    return sendResponse(200, comments);
};

export const handler = middy(getPostComments)
    .use(errorHandler());