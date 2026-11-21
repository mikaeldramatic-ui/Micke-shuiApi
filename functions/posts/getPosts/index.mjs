import middy from '@middy/core';
import { sendResponse } from '../../../utils/sendResponse.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { getPosts } from '../../../services/posts.mjs';

const getAllPosts = async (event) => {
    const username = event.queryStringParameters?.username;

    const posts = await getPosts(username);

    return sendResponse(200, posts);
};

export const handler = middy(getAllPosts)
    .use(errorHandler());