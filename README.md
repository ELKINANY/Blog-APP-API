# 📝 Blog APP API

A robust, production-ready RESTful API for a modern blogging platform. Built with **Node.js**, **Express**, **Prisma**, and **PostgreSQL**, this API provides a full suite of features for content management, user authentication, and interactive social features.

---

## 🚀 The Problem It Solves

Building a blog from scratch requires handling complex logic like nested comments, image management, SEO-friendly slugs, and secure authentication. This project provides a **pluggable backend architecture** that simplifies these tasks, allowing developers to focus on building great frontend experiences while having a reliable, scalable, and secure API handling the data.

---

## ✨ Features

- 🔐 **Secure Authentication**: JWT-based login/register with password hashing (Bcrypt).
- 🔑 **Authorization**: Role-based access control (Admin/User).
- 📧 **Password Recovery**: Secure password reset flow via email notifications.
- 📰 **Post Management**: Full CRUD for posts with draft/published statuses and view counters.
- 📁 **Categorization**: Organize posts into categories with automatic slug generation.
- 💬 **Comment System**: Interactive comments on posts with an approval workflow.
- 📸 **Media Handling**: Seamless image uploads for avatars and posts via **Cloudinary**.
- 🛠 **Data Validation**: Robust request validation using `express-validator`.
- 📊 **Many-to-Many Relations**: Flexible post-category mapping.

---

## 🛠 Tech Stack

| Component          | Technology                 |
| ------------------ | -------------------------- |
| **Runtime**        | Node.js                    |
| **Framework**      | Express.js                 |
| **Database**       | PostgreSQL                 |
| **ORM**            | Prisma                     |
| **Authentication** | JWT (JSON Web Tokens)      |
| **Storage**        | Cloudinary (Image Hosting) |
| **Email**          | Nodemailer                 |

---

## 🏗 System Architecture

The API follows a modular **Controller-Route-Middleware** pattern:

- **Routes**: Define the API endpoints and wire them to controllers.
- **Controllers**: Handle the business logic and interact with the database via Prisma.
- **Middlewares**: Handle cross-cutting concerns like authentication, error handling, and file uploads.
- **Prisma**: Acts as the data access layer, ensuring type-safe database queries.

---

## 💾 Database Schema Overview

The project uses the following core models:

- **Users**: Stores profile info, credentials, and roles.
- **Posts**: Stores content, metadata (views, likes), and status.
- **Categories**: Taxonomies for organizing posts.
- **Comments**: Feedback linked to users and posts.
- **PostCategories**: Junction table for the many-to-many relationship between posts and categories.

---

## 📡 API Structure Overview

### Endpoints

| Route             | Description                                   |
| ----------------- | --------------------------------------------- |
| `/api/auth`       | User registration, login, and password reset. |
| `/api/users`      | Profile management and user-related data.     |
| `/api/posts`      | CRUD operations for blog posts.               |
| `/api/categories` | Manage blog categories.                       |
| `/api/comments`   | Post comments and moderation.                 |

---

## 🔐 Auth Flow

1. **Registration**: User signs up; system hashes password and stores data.
2. **Login**: User provides credentials; system returns a JWT.
3. **Authorized Requests**: Client sends JWT in the `Authorization` header.
4. **Validation**: `authMiddleware` verifies the token and attaches the user to the request.
5. **Role Check**: Optional `allowedTo` middleware restricts access based on roles (e.g., `admin`).

---

## ⚙ Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/blog_db?schema=public"

# Server
PORT=7000

# Security
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=90d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 🛠 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Blog-APP-API
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Database setup**:
   - Create a PostgreSQL database.
   - Run migrations:
     ```bash
     npx prisma migrate dev
     ```
   - Generate Prisma client:
     ```bash
     npx prisma generate
     ```

---

## 🏃 How to Run Locally

Start the development server with `nodemon`:

```bash
npm start
```

The server will be running at `http://localhost:7000`.

---

## 📁 Folder Structure

```text
├── controllers/      # Business logic
├── middlewares/      # Auth, uploads, and errors
├── prisma/           # Schema and migrations
├── routes/           # API route definitions
├── uploads/          # Local temporary storage
├── utils/            # Helpers (Cloudinary, Email, Slugs)
├── .env              # Configuration
├── server.js         # Entry point
└── package.json      # Dependencies
```

---

## 🚢 Deployment Notes

- Ensure `DATABASE_URL` points to a production PostgreSQL instance.
- Configure Cloudinary credentials for persistent image storage.
- Use a process manager like **PM2** for production environments.

---

## 🚀 Future Improvements

- [ ] Full-text search for posts.
- [ ] Integration with a Redis cache for popular posts.
- [ ] Multi-language (i18n) support.
- [ ] Advanced analytics dashboard.

---

## 🤝 Contribution Guidelines

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
