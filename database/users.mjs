import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { db, TABLE_NAME } from './client.mjs';

export const getUserByUsername = async (username) => {
    const { Item } = await db.send(new GetCommand ({
        TableName: TABLE_NAME,
        Key: {
            PK: `USER#${username}`,
            SK: `USER#${username}`
        }
    }));

    return Item;
};

export const createUser = async (user) => {
    await db.send(new PutCommand ({
        TableName: TABLE_NAME,
        Item: {
            PK: `USER#${user.username}`,
            SK: `USER#${user.username}`,
            ...user
        },
        ConditionExpression: 'attribute_not_exists(PK)'
    }));
};