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

