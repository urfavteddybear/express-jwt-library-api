const request = require('supertest');
const app = require('../src/app');

describe('Library API', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);

      expect(res.body.message).toBe('Welcome to the Library Management API!');
      expect(res.body.endpoints).toBeDefined();
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('OK');
      expect(res.body.message).toBe('Library API is running');
    });
  });

  describe('GET /api/v1/books', () => {
    it('should return list of books', async () => {
      const res = await request(app)
        .get('/api/v1/books')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/categories', () => {
    it('should return list of categories', async () => {
      const res = await request(app)
        .get('/api/v1/categories')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
