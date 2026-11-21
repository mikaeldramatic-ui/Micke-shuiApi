import { createError } from '@middy/util';
import { verifyToken } from '../utils/token.mjs';

export const authenticate = () => ({
    before: (request) => {
        const authHeader = request.event.headers?.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError(401, 'Missing or invalid token.');
        }
        const token = authHeader.split(' ')[1];

        try {
            request.event.user = verifyToken(token);
        } catch (error) {
            throw createError(401, 'Invalid or expired token.');
        }
    }
});