import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { sendResponse } from '../../../utils/sendResponse.mjs';
import { authenticate } from '../../../middlewares/authenticate.mjs';
import { validate } from '../../../middlewares/validate.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { commentSchema } from '../../../schemas/comments.mjs';
import { addComment } from '../../../services/comments.mjs';

const createComment = async (event) => {
    const { postId } = event.pathParameters;
    const { content} = event.body;
    const username = event.user.username;

    const comment = await addComment(postId, username, content);

    return sendResponse(201, {
        message: 'Comment created successfully',
        comment: comment
    });
};

export const handler = middy(createComment)
    .use(authenticate())
    .use(httpJsonBodyParser())
    .use(validate(commentSchema))
    .use(errorHandler());
