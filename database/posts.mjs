import { GetCommand, PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { db, TABLE_NAME } from './client.mjs';

export const createPost = async (post) => {
    await db.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            PK: `POST#${post.id}`,
            SK: `POST#${post.id}`,
            GSI1PK: `USER#${post.username}`,
            GSI1SK: post.createdAt,
            GSI2PK: 'POSTS',
            GSI2SK: post.createdAt,
            ...post
        }
    }));
};

const toPost = (item) => ({
    id: item.id,
    username: item.username,
    isGuest: item.isGuest,
    title: item.title,
    content: item.content,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt

});

export const getPostById = async (postId) => {
    const { Item } = await db.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {
            PK: `POST#${postId}`,
            SK: `POST#${postId}`
        }
    }));

    return Item ? toPost(Item) : undefined;
};

export const getAllPosts = async () => {
    const { Items } = await db.send(new QueryCommand ({
        TableName: TABLE_NAME,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: {
            ':pk': 'POSTS'
        },
        ScanIndexForward: false
    }));

    return Items.map(toPost);
};

export const getPostsByUsername = async (username) => {
    const { Items } = await db.send(new QueryCommand ({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: {
            ':pk': `USER#${username}`
        },
        ScanIndexForward: false
    }));

    return Items.map(toPost);
};

export const updatePost = async (postId, title, content, updatedAt) => {
    const { Attributes } = await db.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
            PK: `POST#${postId}`,
            SK: `POST#${postId}`
        },
        UpdateExpression: 'SET #title = :title, #content = :content, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
            '#title': 'title',
            '#content': 'content',
        },
        ExpressionAttributeValues: {
          ':title': title,
            ':content': content,
            ':updatedAt': updatedAt
        },  
        ReturnValues: 'ALL_NEW'
    }));

    return toPost(Attributes);
};

export const deletePost = async (postId) => {
    await db.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
            PK: `POST#${postId}`,
            SK: `POST#${postId}`
        }
    }));
};