const express = require('express');
const router = express.Router();

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateRequest, categorySchemas } = require('../middleware/validation');

// Public routes (with optional auth for enhanced features)
router.route('/')
  .get(optionalAuth, getCategories)
  .post(protect, authorize('admin'), validateRequest(categorySchemas.create), createCategory);

router.route('/:id')
  .get(optionalAuth, getCategory)
  .put(protect, authorize('admin'), validateRequest(categorySchemas.update), updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
