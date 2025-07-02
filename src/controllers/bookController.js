const Book = require('../models/Book');
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../config/logger');

// @desc    Get all books
// @route   GET /api/v1/books
// @access  Public
const getBooks = asyncHandler(async (req, res) => {
  const {
    search,
    category_id,
    author,
    sortBy,
    sortOrder,
    page = 1,
    limit = 10
  } = req.query;

  logger.debug('Fetching books with filters', {
    search,
    category_id,
    author,
    sortBy,
    sortOrder,
    page,
    limit
  });

  const filters = {
    search,
    category_id: category_id ? parseInt(category_id) : undefined,
    author,
    sortBy,
    sortOrder,
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  };

  const books = await Book.findAll(filters);
  const total = await Book.count(filters);
  const totalPages = Math.ceil(total / parseInt(limit));

  logger.info('Books retrieved successfully', {
    count: books.length,
    total,
    page: parseInt(page),
    totalPages
  });

  res.status(200).json({
    success: true,
    count: books.length,
    total,
    currentPage: parseInt(page),
    totalPages,
    data: books
  });
});

// @desc    Get single book
// @route   GET /api/v1/books/:id
// @access  Public
const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({
      success: false,
      error: 'Book not found'
    });
  }

  res.status(200).json({
    success: true,
    data: book
  });
});

// @desc    Create new book
// @route   POST /api/v1/books
// @access  Public
const createBook = asyncHandler(async (req, res) => {
  logger.info('Creating new book', { bookData: req.body });
  
  const book = await Book.create(req.body);

  logger.info('Book created successfully', { 
    bookId: book.id, 
    title: book.title 
  });

  res.status(201).json({
    success: true,
    data: book
  });
});

// @desc    Update book
// @route   PUT /api/v1/books/:id
// @access  Public
const updateBook = asyncHandler(async (req, res) => {
  const bookId = req.params.id;
  
  logger.info('Updating book', { 
    bookId, 
    updateData: req.body 
  });
  
  let book = await Book.findById(bookId);

  if (!book) {
    logger.warn('Book not found for update', { bookId });
    return res.status(404).json({
      success: false,
      error: 'Book not found'
    });
  }

  book = await Book.update(bookId, req.body);

  logger.info('Book updated successfully', { 
    bookId, 
    title: book.title 
  });

  res.status(200).json({
    success: true,
    data: book
  });
});

// @desc    Delete book
// @route   DELETE /api/v1/books/:id
// @access  Public
const deleteBook = asyncHandler(async (req, res) => {
  const bookId = req.params.id;
  const book = await Book.findById(bookId);

  if (!book) {
    logger.warn('Book not found for deletion', { bookId });
    return res.status(404).json({
      success: false,
      error: 'Book not found'
    });
  }

  await Book.delete(bookId);

  logger.info('Book deleted successfully', { 
    bookId, 
    title: book.title 
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Book deleted successfully'
  });
});

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
};
