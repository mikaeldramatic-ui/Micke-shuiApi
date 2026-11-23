import { createError } from '@middy/util';
import { createPost, getPostById, getAllPosts, getPostsByUsername, updatePost, deletePost } from '../database/posts.mjs';

export const createNewPost = async (username, title, content) => {
    const now = new Date().toISOString();

    const post = {
        id: crypto.randomUUID(),
        username: username,
        isGuest: false,
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
    await deletePost(postId);
};