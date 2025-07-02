# Authentication & Authorization Documentation

## Overview
The Library API uses JWT (JSON Web Tokens) for authentication and role-based access control (RBAC) for authorization.

## User Roles

### Available Roles
- **user**: Regular user with read access
- **admin**: Can manage books and categories
- **super_admin**: Full access including user management

### Role Hierarchy
```
super_admin > admin > user
```

## Authentication Endpoints

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

**Password Requirements:**
- Minimum 6 characters
- At least 1 lowercase letter
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### Update User Details
```http
PUT /api/v1/auth/updatedetails
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

### Update Password
```http
PUT /api/v1/auth/updatepassword
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass123!"
}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

**Note**: The logout endpoint works with or without a valid token. If a token is provided, it will be blacklisted to prevent reuse.

## User Management (Admin Only)

### Get All Users
```http
GET /api/v1/users
Authorization: Bearer ADMIN_JWT_TOKEN
```

### Get Single User
```http
GET /api/v1/users/:id
Authorization: Bearer ADMIN_JWT_TOKEN
```

### Create User (Admin)
```http
POST /api/v1/users
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

### Update User (Admin)
```http
PUT /api/v1/users/:id
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "role": "admin"
}
```

### Delete User (Admin)
```http
DELETE /api/v1/users/:id
Authorization: Bearer ADMIN_JWT_TOKEN
```

## Protected Routes

### Books
- **GET /api/v1/books** - Public (optional auth for enhanced features)
- **GET /api/v1/books/:id** - Public (optional auth)
- **POST /api/v1/books** - Admin only
- **PUT /api/v1/books/:id** - Admin only
- **DELETE /api/v1/books/:id** - Admin only

### Categories
- **GET /api/v1/categories** - Public (optional auth)
- **GET /api/v1/categories/:id** - Public (optional auth)
- **POST /api/v1/categories** - Admin only
- **PUT /api/v1/categories/:id** - Admin only
- **DELETE /api/v1/categories/:id** - Admin only

### Users
- **All /api/v1/users/** routes - Admin/Super Admin only

## Using JWT Tokens

### Header Format
```http
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Token Expiration
- Default: 7 days
- Configurable via `JWT_EXPIRES_IN` environment variable

### Token Blacklisting
- Tokens are blacklisted when users logout
- Blacklisted tokens cannot be used for authentication
- Database persistence for scalability and reliability
- Automatic cleanup of expired blacklisted tokens
- Tracking of blacklist reason and user ID

### Token Payload
```json
{
  "userId": 1,
  "role": "user",
  "iat": 1641234567,
  "exp": 1641839367
}
```

## Default Users

After running database setup, these users are created:

### Admin User
- **Username**: admin
- **Email**: admin@library.com
- **Password**: Admin123!
- **Role**: admin

### Regular User
- **Username**: user
- **Email**: user@library.com
- **Password**: User123!
- **Role**: user

## Security Features

### Password Security
- Bcrypt hashing with 12 salt rounds
- Strong password requirements
- Password change requires current password verification

### Token Security
- JWT tokens with configurable expiration
- Token blacklisting on logout for enhanced security
- Request ID tracking for audit trails
- Comprehensive logging of auth events

### Token Blacklist Database
```sql
CREATE TABLE blacklisted_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  user_id INT,
  expires_at TIMESTAMP NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(100) DEFAULT 'logout'
)
```
- Only stores secure token hash, not the actual token
- Tracks expiration for automatic cleanup
- Associates blacklisted tokens with users when possible
- Records reason for blacklisting (logout, security incident, etc.)
- Automatic hourly cleanup of expired tokens

### Route Protection
- Role-based access control
- Optional authentication for public routes
- Admin self-protection (can't delete/demote themselves)

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied. Insufficient permissions."
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Password must contain at least 6 characters, including uppercase, lowercase, number and special character"
}
```

## Best Practices

1. **Store tokens securely** - Use httpOnly cookies or secure storage
2. **Use HTTPS in production** - Never send tokens over HTTP
3. **Implement token refresh** - For better user experience
4. **Monitor auth logs** - Watch for suspicious activities
5. **Regular password updates** - Encourage users to change passwords
6. **Rate limiting** - Prevent brute force attacks on auth endpoints
