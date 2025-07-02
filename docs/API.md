# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Currently, the API does not require authentication, but you can extend it with JWT authentication.

## Response Format
All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "count": 10,
  "total": 50,
  "currentPage": 1,
  "totalPages": 5
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Endpoints

### Books

#### GET /books
Get all books with optional filtering and pagination.

**Query Parameters:**
- `search` - Search in title and author
- `category_id` - Filter by category ID
- `author` - Filter by author name
- `sortBy` - Sort field (title, author, published_year)
- `sortOrder` - Sort order (ASC, DESC)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```
GET /api/v1/books?search=gatsby&category_id=1&page=1&limit=5
```

#### GET /books/:id
Get a single book by ID.

#### POST /books
Create a new book.

**Request Body:**
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "1234567890",
  "category_id": 1,
  "description": "Book description",
  "published_year": 2023,
  "pages": 300,
  "total_copies": 5,
  "available_copies": 5
}
```

#### PUT /books/:id
Update a book by ID.

#### DELETE /books/:id
Delete a book by ID.

### Categories

#### GET /categories
Get all categories.

#### GET /categories/:id
Get a single category by ID.

**Query Parameters:**
- `includeBooks` - Include books in the category (true/false)

#### POST /categories
Create a new category.

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Category description"
}
```

#### PUT /categories/:id
Update a category by ID.

#### DELETE /categories/:id
Delete a category by ID (only if no books are assigned to it).

## Error Codes

- `400` - Bad Request (validation errors, duplicate entries)
- `404` - Not Found
- `500` - Internal Server Error
