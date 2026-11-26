import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username can be at most 20 characters')
        .regex(/^[a-zA-Z0-9]+$/, 'Username may only contain letters and numbers'),
    password: z.string('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character')    
});

export const loginSchema = z.object({
    username: z.string('Username is required')
        .min(1, 'Username is required'),
    password: z.string('Password is required')
        .min(1, 'Password is required')
});