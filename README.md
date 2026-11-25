# Shui API

Shui is a backend REST API for a message board. Users can register and log in with a username and password to write posts and comments, and edit or delete their own posts. Guests can also write posts without an account, and get a random guest name. Anyone can read posts and comments.

**Deployed API:** https://9hw7oyegkg.execute-api.eu-north-1.amazonaws.com

## Why I built it

Through this project I learned how to protect a REST API. Authentication checks who the user is, and authorization checks what they are allowed to do – for example, only the owner can edit or delete a post. After logging in, the user gets a JWT that works like an access card: it is signed with a secret key, expires after one hour, and proves the user's identity on every request without sending the password again. Incoming data is validated with Zod, so invalid or manipulated data never reaches the database.

## Tech stack

- **JavaScript** (ES modules, `.mjs`) on **Node.js 24** (arm64)
- **AWS Lambda** – runs the handler code for each endpoint
- **Amazon API Gateway** – receives HTTP requests and routes them to the right Lambda
- **Amazon DynamoDB** – stores users, posts and comments in a single table
- **Serverless Framework** – defines and deploys all infrastructure from `serverless.yml`

**Packages**

- `@middy/core` – middleware engine for Lambda (authentication, authorization, validation, error handling)
- `@middy/http-json-body-parser` – parses the JSON request body
- `zod` – validates request bodies against schemas
- `bcryptjs` – hashes passwords with salt (passwords are never stored in plain text)
- `jsonwebtoken` – signs and verifies JWT tokens (valid for 1 hour)
- `@aws-sdk/lib-dynamodb` – lets the code read and write to DynamoDB

## Architecture

The code is split into layers, so each part has one responsibility:

```
functions/    → Lambda handlers: receive the request and return the response
services/     → business logic (hashing, guest names, ownership, cascade delete)
database/     → all DynamoDB commands (Get, Put, Query, Update, Delete)
middlewares/  → authenticate, optionalAuthenticate, authorize, validate, errorHandler
schemas/      → Zod schemas for request bodies
utils/        → helpers: sendResponse, JWT sign/verify, guest name generator
```

This makes the code easier to read, test and change – for example, the database could be replaced without touching the handlers.

### Database design

All data is stored in **one DynamoDB table** (`ShuiTable`) using single-table design. Every access pattern uses `Get` or `Query` – never `Scan`.

| Item | PK | SK |
|---|---|---|
| User | `USER#<username>` | `USER#<username>` |
| Post | `POST#<id>` | `POST#<id>` |
| Comment | `POST#<postId>` | `COMMENT#<createdAt>#<id>` |

| Index | PK | SK | Used for |
|---|---|---|---|
| GSI1 | `USER#<username>` | `createdAt` | All posts by one user, newest first |
| GSI2 | `POSTS` | `createdAt` | All posts, newest first |

Comments share the post's partition key, so all comments for a post are fetched with a single Query, oldest first. When a post is deleted, its comments are deleted too.

## Endpoints

**Base URL:** `https://9hw7oyegkg.execute-api.eu-north-1.amazonaws.com`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Log in and receive a JWT |
| POST | `/posts` | Optional | Create a post (guest if no token) |
| GET | `/posts` | No | Get all posts, newest first. Use `?username=` to filter by user |
| GET | `/posts/{postId}` | No | Get one post |
| PUT | `/posts/{postId}` | Yes (owner) | Update your own post |
| DELETE | `/posts/{postId}` | Yes (owner) | Delete your own post and its comments |
| GET | `/posts/{postId}/comments` | No | Get comments, oldest first |
| POST | `/posts/{postId}/comments` | Yes | Add a comment |

Protected endpoints require the header `Authorization: Bearer <token>`.

