import { deleteCommentsByPostId } from '../database/comments.mjs';
import { createError } from '@middy/util';
import { createPost, getPostById, getAllPosts, getPostsByUsername, updatePost, deletePost } from '../database/posts.mjs';
import { generateGuestName } from '../utils/guestName.mjs';

export const createNewPost = async (user, title, content) => {
    const isGuest = !user;
    const username = isGuest ? generateGuestName() : user.username;
    const now = new Date().toISOString();

    const post = {
        id: crypto.randomUUID(),
        username: username,
        isGuest: isGuest,
        title: title,
        content: content,
        createdAt: now,
        updatedAt: now
    };

    await createPost(post);

    return post;
};

export const getPosts = async (username) => {
    if (username) {
        return await getPostsByUsername(username);
    }

    return await getAllPosts();
};

export const getPost = async (postId) => {
    const post = await getPostById(postId);

    if (!post) {
        throw createError(404, 'Post not found');
    }

    return post;
};

export const editPost = async (postId, title, content) => {
    const updatedAt = new Date().toISOString();

    return await updatePost(postId, title, content, updatedAt);
};

export const removePost = async (postId) => {
    await deleteCommentsByPostId(postId);
    await deletePost(postId);
};