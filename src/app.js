const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./config/logger');
const TokenBlacklist = require('./models/TokenBlacklist');
const { httpLogger, requestId, logRequest, logResponse } = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging middleware (should be first)
app.use(requestId);
app.use(httpLogger);
app.use(logRequest);
app.use(logResponse);

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/categories', categoryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Library API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Library Management API!',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      books: '/api/v1/books',
      categories: '/api/v1/categories',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('🚀 Library API Server started', {
    port: PORT,
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    url: `http://localhost:${PORT}`
  });
  
  // Schedule regular cleanup of expired blacklisted tokens
  const ONE_HOUR = 60 * 60 * 1000;
  setInterval(async () => {
    try {
      const cleanedCount = await TokenBlacklist.cleanupExpiredTokens();
      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired blacklisted tokens`);
      }
    } catch (error) {
      logger.error('Token cleanup job failed', { error: error.message });
    }
  }, ONE_HOUR);
});

module.exports = app;
