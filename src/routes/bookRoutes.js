const express = require('express');
const router = express.Router();

const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateRequest, bookSchemas } = require('../middleware/validation');

// Public routes (with optional auth for enhanced features)
router.route('/')
  .get(optionalAuth, getBooks)
  .post(protect, authorize('admin'), validateRequest(bookSchemas.create), createBook);

router.route('/:id')
  .get(optionalAuth, getBook)
  .put(protect, authorize('admin'), validateRequest(bookSchemas.update), updateBook)
  .delete(protect, authorize('admin'), deleteBook);

module.exports = router;
