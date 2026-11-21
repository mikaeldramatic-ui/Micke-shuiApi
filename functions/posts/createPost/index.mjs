import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { sendResponse } from '../../../utils/sendResponse.mjs';
import { authenticate } from '../../../middlewares/authenticate.mjs'
import { validate } from '../../../middlewares/validate.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { postSchema } from '../../../schemas/posts.mjs';
import { createNewPost } from '../../../services/posts.mjs';

const createPost = async (event) => {
    const { title, content } = event.body;
    const username = event.user.username;

    const post = await createNewPost(username, title, content);

    return sendResponse(201, {
        message: 'Post created successfully',
        post: post
    });
};

export const handler = middy(createPost)
    .use(authenticate())
    .use(httpJsonBodyParser())
    .use(validate(postSchema))
    .use(errorHandler());