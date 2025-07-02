# Library Management API

A RESTful API for managing a library system with books and categories, built with Express.js and MySQL.

## Features

- 📚 Book management (CRUD operations)
- 🏷️ Category management
- � JWT Authentication & Authorization
- 👤 User management with role-based access control
- � Search and filtering capabilities
- 📊 API rate limiting
- 🛡️ Security middleware
- ✅ Input validation
- 📝 Comprehensive logging system
- 📖 API documentation

## Project Structure

```
library-api/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── app.js           # Main application file
├── tests/               # Test files
├── docs/                # API documentation
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
└── package.json        # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and configuration.

4. Set up the database:
   ```bash
   npm run db:setup
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## Default Users

After database setup, you can use these accounts:

**Admin Account:**
- Email: admin@library.com
- Password: Admin123!
- Role: admin

**User Account:**
- Email: user@library.com  
- Password: User123!
- Role: user

## Authentication

The API uses JWT tokens for authentication. Include the token in requests:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

For detailed authentication documentation, see [AUTHENTICATION.md](docs/AUTHENTICATION.md)

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (Protected)
- `PUT /api/v1/auth/updatedetails` - Update user details (Protected)
- `PUT /api/v1/auth/updatepassword` - Update password (Protected)
- `GET /api/v1/auth/logout` - Logout user (Protected)

### User Management (Admin Only)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get a specific user
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user

### Books
- `GET /api/v1/books` - Get all books (Public)
- `GET /api/v1/books/:id` - Get a specific book (Public)
- `POST /api/v1/books` - Create a new book (Admin)
- `PUT /api/v1/books/:id` - Update a book (Admin)
- `DELETE /api/v1/books/:id` - Delete a book (Admin)

### Categories
- `GET /api/v1/categories` - Get all categories (Public)
- `GET /api/v1/categories/:id` - Get a specific category (Public)
- `POST /api/v1/categories` - Create a new category (Admin)
- `PUT /api/v1/categories/:id` - Update a category (Admin)
- `DELETE /api/v1/categories/:id` - Delete a category (Admin)

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:setup` - Set up database tables

## License

MIT
