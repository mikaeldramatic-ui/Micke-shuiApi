import { z } from 'zod';

export const postSchema = z.object({
    title: z.string('Title is required')
        .trim()
        .min(1, 'Title cannot be empty')
        .max(100, 'Title can be at most 100 characters'),
    content: z.string('Content is required')
        .trim()
        .min(1, 'Content cannot be empty')
        .max(1000, 'Content can be at most 1000 characters')
});