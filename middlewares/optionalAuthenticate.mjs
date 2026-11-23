import { createError } from '@middy/util';
import { verifyToken } from '../utils/token.mjs';

export const optionalAuthenticate = () => ({
    before: (request) => {
        const authHeader = request.event.headers?.authorization;

        if (!authHeader) {
            request.event.user = null;
            return;
        }

        if (!authHeader.startsWith('Bearer ')) {
            throw createError(401, 'Invalid token');
        }

        const token = authHeader.split(' ')[1];

        try {
            request.event.user = verifyToken(token);
        } catch (error) {
            throw createError(401, 'Invalid or expired token');
        }
    }
});