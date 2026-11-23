import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { db, TABLE_NAME } from './client.mjs';

const toComment = (item) => ({
    id: item.id,
    postId: item.postId,
    username: item.username,
    content: item.content,
    createdAt: item.createdAt
});

export const createComment = async (comment) => {
    await db.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            PK: `POST#${comment.postId}`,
            SK: `COMMENT#${comment.createdAt}#${comment.id}`,
            ...comment
        }
    }));
};

export const getCommentsByPostId = async (postId) => {
    const { Items } = await db.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
            ':pk': `POST#${postId}`,
            ':sk': `COMMENT#`
        }
    }));

    return Items.map(toComment);
};