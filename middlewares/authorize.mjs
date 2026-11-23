import { createError } from '@middy/util';
import { getPost } from '../services/posts.mjs';

export const authorize = () => ({
    before: async (request) => {
        const { postId } = request.event.pathParameters;

        const post = await getPost(postId);

        const isOwner = post.username === request.event.user.username && post.isGuest === false;

        if (!isOwner) {
            throw createError(403, 'You are not allowed to modify this post');
        }

        request.event.post = post;
    }
});