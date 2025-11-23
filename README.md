# Blog-APP-API

A simple Blog REST API built with Node.js and Prisma.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Environment variables](#environment-variables)
  - [Database / Prisma](#database--prisma)
  - [Run the server](#run-the-server)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Posts](#posts)
  - [Categories](#categories)
  - [Comments](#comments)
- [Validation & Middlewares](#validation--middlewares)
- [Error handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

This repository contains a backend API for a blog application. The API provides endpoints for user authentication, creating and managing posts, and managing categories. It uses Prisma as an ORM and follows a typical controllers/routes/middlewares pattern.

## Features

- User authentication (signup / login)
- CRUD for posts
- Category management
- Input validation
- Centralized error handling
- Comments on posts (create / read / delete)

## Tech Stack

- Node.js
- Express
- Prisma
- (Optional) Nodemailer for sending emails

## Project Structure

Key files and folders:

- `server.js` - app entry point and HTTP server setup
- `controllers/` - request handlers for auth, posts, categories
- `routes/` - route definitions for each resource
- `middlewares/` - auth, validation, and error handling middlewares
- `utils/` - helpers like `apiError.js` and `sendMail.js`
- `prisma/schema.prisma` - Prisma schema and datasource configuration
- `generated/` - generated Prisma client and runtime artifacts

Short view:

```
.
├─ server.js
├─ controllers/
├─ routes/
├─ middlewares/
├─ utils/
└─ prisma/
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- A database supported by Prisma (Postgres, MySQL, SQLite, SQL Server)
- Yarn or npm

### Install

1. Clone the repo

2. Install dependencies

```bash
# using npm
npm install

# or using yarn
yarn
```

### Environment variables

Create a `.env` file in the project root with at least the following values:

- `DATABASE_URL` - your Prisma-compatible database connection string
- `JWT_SECRET` - secret key for signing JWT tokens
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` - (optional) SMTP credentials if `sendMail.js` is used
- `PORT` - port for the server (default 3000)

Example `.env`:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/blogdb?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=3000
```

### Database / Prisma

The Prisma schema is at `prisma/schema.prisma`. Typical Prisma commands:

```bash
# generate the Prisma client
npx prisma generate

# create/migrate the database (if using migrations)
npx prisma migrate dev --name init

# open Prisma studio
npx prisma studio
```

> Note: This project includes a `generated/` folder with compiled Prisma artifacts. You can regenerate them with `prisma generate` if you change the schema.

### Run the server

```bash
# development
npm run dev

# or
node server.js
```

If `package.json` has a `dev` script (e.g., using nodemon) prefer that in development.

## API Endpoints

Below are the main endpoints. Adjust according to actual route definitions in `routes/`.

### Authentication

- POST /auth/register - register a new user
- POST /auth/login - login and receive a JWT

Example request (login):

```bash
curl -X POST http://localhost:3000/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"user@example.com","password":"secret"}'
```

### Posts

- GET /posts - list posts
- GET /posts/:id - get a single post
- POST /posts - create a post (auth required)
- PUT /posts/:id - update a post (auth/ownership required)
- DELETE /posts/:id - delete a post (auth/ownership required)

### Categories

- GET /categories - list categories
- POST /categories - create a category (auth required)

### Comments

- GET /posts/:postId/comments - list comments for a post
- POST /posts/:postId/comments - add a comment to a post (auth required)
- DELETE /comments/:id - delete a comment (auth/ownership or admin required)

Example request (add comment):

```bash
curl -X POST http://localhost:3000/posts/123/comments \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <JWT>" \
	-d '{"content":"Great post!","authorName":"Ali"}'
```

Example response (201 Created):

```json
{
  "id": 456,
  "postId": 123,
  "content": "Great post!",
  "authorName": "Ali",
  "createdAt": "2025-11-23T12:34:56.000Z"
}
```

## Validation & Middlewares

Validation is implemented in `validators/` and wired via `validator.middleware.js`. Authentication is handled in `auth.middleware.js`. Errors are normalized by `error.middleware.js` and helper `utils/apiError.js`.

## Error handling

The app uses a centralized error middleware that returns JSON errors with an HTTP status code and message. See `middlewares/error.middleware.js` for the exact format.

## Testing

If you'd like to add tests, consider using Jest and supertest to test routes and controllers. Add a `test` script in `package.json`:

```json
"scripts": {
	"test": "jest"
}
```

## Deployment

Deploy like a typical Node.js app. Steps:

1. Set environment variables on the host.
2. Run `npm install --production`.
3. Run `npx prisma migrate deploy` (if using migrations).
4. Start the server: `node server.js` or use a process manager like PM2.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a PR with tests and a description

## License

Specify your license here (e.g., MIT).

---

If you'd like, I can also:

- add example curl requests for other endpoints (posts, categories)
- list concrete environment variable names from your codebase
- add a quick health-check endpoint and documentation

Let me know which of those you'd like next.
