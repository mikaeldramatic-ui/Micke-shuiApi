import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { sendResponse } from '../../../utils/sendResponse.mjs';
import { validate } from '../../../middlewares/validate.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { registerSchema } from '../../../schemas/auth.mjs';
import { registerUser } from '../../../services/auth.mjs';

const register = async (event) => {
    const { username, password } = event.body;

    const user = await registerUser(username, password);

    return sendResponse(201, {
        message: 'User registered successfully',
        username: user.username
    });
};

export const handler = middy(register)
    .use(httpJsonBodyParser())
    .use(validate(registerSchema))
    .use(errorHandler());