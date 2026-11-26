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

## Getting started

**Prerequisites:** Node.js 24, Serverless Framework v4, and an AWS account.

```bash
git clone https://github.com/mikaeldramatic-ui/Micke-shuiApi.git
cd Micke-shuiApi
npm install
````

Create an IAM role with access to DynamoDB and CloudWatch Logs. Then create a `config.yml` file in the root folder (it is ignored by Git and must never be committed).

```yaml
role: arn:aws:iam::<your-account-id>:role/<your-role-name>
jwtSecret: <a-long-random-string>
````

The `jwtSecret` is not something you find - you create it yourself. It can be any long random string. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
````

Change `org` in `serverless.yml` to your own Serverless organization, then deploy:

```bash
serverless deploy
````

## Testing the API

I tested the API in **Insomnia** with an environment variable `base_url` set to the API URL, and the requests grouped in three folders: **Auth**, **Posts**, and **Comments**.

### Test flow

1. **Register** -> `POST /auth/register`
    ```json
    { "username": "anna", "password": "Password123!" }
    ```
2. **Log in** -> `POST /auth/login` with the same body. Copy the `token` from the response.
3. **Create a post** -> `POST /posts`. Add the token under **Auth -> Bearer Token**. Without a token, the post is created as a guest with a random name (e.g. `otter123`).
   ```json
   { "title": "Hello", "content": "My first post" }
   ```
4. **Get posts** -> `GET /posts`, `GET /posts?username=anna` or `GET /posts/{postId}`
5. **Update** -> `PUT /posts/{postId}` with token and a new title and content
6. **Comment** -> `POST /posts/{postId}/comments` with token
   ```json
   { "content": "Nice post!" }
   ```
7. **Get comments** -> `GET /posts/{postId}/comments`
8. **Delete** -> `DELETE /posts/{postId}` with token (its comments are deleted too)

### Error cases tested

| Test | Expected |
|---|---|
| Register with an existing username | `409 Conflict` |
| Weak password or invalid body | `400 Bad Request` |
| Wrong password at login | `401 Unauthorized` |
| Missing or invalid token on a protected endpoint | `401 Unauthorized` |
| Edit or delete someone else's post (or a guest post) | `403 Forbidden` |
| Post that does not exist | `404 Not Found`|

## Troubleshooting

| Problem | Cause | Fix |
|--|--|--|
| New posts did not show up in `GET /posts`, but no error was thrown | Typo `GASI2SK` instead of `GSI2SK` - DynamoDB only adds items to an index if the exact attribute name exists | Corrected the spelling |
| Password regex did not work as expected | The Mac "dead key" turned `^a` into `â` | Press space after `^`|
| `GET /posts/{postId}` could not find the post | Used `queryStringParameters` instead of `pathParameters` | Read `postId` from `event.pathParameters` |
| VS Code autocomplete imported `DeleteTableCommand` instead of `UpdateCommand` | Accepted the suggestion too quickly | Removed it - that command could have deleted the whole table! |
| Malformed JSON returned `422` and a missing body returned `415` | `http-json-body-parser` throws its own status codes, which are not in the API spec | `errorHandler` converts `415` and `422` to `400` |

## Lessons learned

- **Small typos cause big problems** - in code, in `serverless.yml` and in request bodies. Some errors are silent.
- **JWT** works like a temporary access card. A short lifetime (1 hour) limits the damage if a token is stolen.
- **Authentication and Authorization** make sure only the right person can change data.
- **Middy** keeps handlers clean by moving auth, validation and error handling into reusable middlewares.
- **A layered folder structure** makes the code easier to read and understand.
- **Avoid `Scan`** - it reads the whole table and costs more. Designing keys and indexes (PK, SK, GSI1, GSI2) for each access pattern is faster and cheaper.
