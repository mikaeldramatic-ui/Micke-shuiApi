import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { sendResponse } from '../../../utils/sendResponse.mjs';
import { optionalAuthenticate } from '../../../middlewares/optionalAuthenticate.mjs';
import { validate } from '../../../middlewares/validate.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { postSchema } from '../../../schemas/posts.mjs';
import { createNewPost } from '../../../services/posts.mjs';

const createPost = async (event) => {
    const { title, content } = event.body;

    const post = await createNewPost(event.user, title, content);

    return sendResponse(201, {
        message: 'Post created successfully',
        post: post
    });
};

export const handler = middy(createPost)
    .use(optionalAuthenticate())
    .use(httpJsonBodyParser())
    .use(validate(postSchema))
    .use(errorHandler());