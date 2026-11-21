import bcrypt from 'bcryptjs';
import { createError } from '@middy/util';
import { createUser, getUserByUsername } from '../database/users.mjs';
import { signToken } from '../utils/token.mjs';

export const registerUser = async (username, password) => {
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        await createUser({
            username: username,
            passwordHash: passwordHash,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            throw createError(409, 'Username is already taken');
        }
        throw error;
    }

    return { username: username };
};

export const loginUser = async (username, password) => {
    const user = await getUserByUsername(username);

    if (!user) {
        throw createError(401, 'Invalid username or password'); 
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
        throw createError(401, 'Invalid username or password');
    }

    const token = signToken({ username: user.username });

    return { token: token, username: user.username };
    
};


