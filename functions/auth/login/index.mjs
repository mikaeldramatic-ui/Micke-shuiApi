import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { sendResponse } from '../../../utils/sendResponse.mjs';
import { validate } from '../../../middlewares/validate.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { loginSchema } from '../../../schemas/auth.mjs';
import { loginUser } from '../../../services/auth.mjs';

const login = async (event) => {
    const { username, password } = event.body;

    const user = await loginUser(username, password);

    return sendResponse(200, {
        message: 'Login successful',
        token: user.token,
        username: user.username
    });
};

export const handler = middy(login)
    .use(httpJsonBodyParser())
    .use(validate(loginSchema))
    .use(errorHandler());