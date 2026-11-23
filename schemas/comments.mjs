import { z } from 'zod';

export const commentSchema = z.object({
    content: z.string('Content is required')
        .trim()
        .min(1, 'Content cannot be empty')
        .max(500, 'Content can be at most 500 characters')
});