import { createComment, getCommentsByPostId } from '../database/comments.mjs';
import { getPost } from './posts.mjs';

export const addComment = async (postId, username, content) => {
    await getPost(postId);

    const comment = {
        id: crypto.randomUUID(),
        postId: postId,
        username: username,
        content: content,
        createdAt: new Date().toISOString()
    };

    await createComment(comment);

    return comment;

};

export const getComments = async (postId) => {
    await getPost(postId);

    return await getCommentsByPostId(postId);
};