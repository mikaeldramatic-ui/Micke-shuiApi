import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { sendResponse } from '../../../utils/sendResponse.mjs';
import { authenticate } from '../../../middlewares/authenticate.mjs';
import { authorize } from '../../../middlewares/authorize.mjs';
import { validate } from '../../../middlewares/validate.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { postSchema } from '../../../schemas/posts.mjs';
import { editPost } from '../../../services/posts.mjs';

const updateOnePost = async (event) => {
    const { postId } = event.pathParameters;
    const { title, content } = event.body;

    const post = await editPost(postId, title, content);

    return sendResponse(200, {
        message: 'Post updated successfully',
        post: post
    });
};

export const handler = middy(updateOnePost)
    .use(authenticate())
    .use(authorize())
    .use(httpJsonBodyParser())
    .use(validate(postSchema))
    .use(errorHandler());