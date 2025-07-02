const Category = require('../models/Category');
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../config/logger');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll();

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const { includeBooks } = req.query;
  
  let category;
  if (includeBooks === 'true') {
    category = await Category.findByIdWithBooks(req.params.id);
  } else {
    category = await Category.findById(req.params.id);
  }

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Public
const createCategory = asyncHandler(async (req, res) => {
  logger.info('Creating new category', { categoryData: req.body });
  
  const category = await Category.create(req.body);

  logger.info('Category created successfully', { 
    categoryId: category.id, 
    name: category.name 
  });

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Public
const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  category = await Category.update(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Public
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  await Category.delete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Category deleted successfully'
  });
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
