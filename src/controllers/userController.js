const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../config/logger');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  logger.info('Admin fetching all users', { adminId: req.user.id });

  const users = await User.findAll();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    logger.warn('User not found', { 
      userId: req.params.id, 
      adminId: req.user.id 
    });
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  logger.info('Admin fetched user details', { 
    userId: user.id, 
    adminId: req.user.id 
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  logger.info('Admin creating user', { 
    adminId: req.user.id,
    newUserData: { 
      username: req.body.username, 
      email: req.body.email, 
      role: req.body.role 
    }
  });

  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    logger.warn('User not found for update', { 
      userId: req.params.id, 
      adminId: req.user.id 
    });
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Prevent admin from updating their own role unless they're a super admin
  if (req.params.id === req.user.id.toString() && req.body.role && req.user.role !== 'super_admin') {
    logger.warn('Admin attempted to change own role', { adminId: req.user.id });
    return res.status(403).json({
      success: false,
      error: 'Cannot change your own role'
    });
  }

  logger.info('Admin updating user', { 
    userId: req.params.id, 
    adminId: req.user.id,
    updateData: req.body
  });

  user = await User.update(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    logger.warn('User not found for deletion', { 
      userId: req.params.id, 
      adminId: req.user.id 
    });
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Prevent admin from deleting themselves
  if (req.params.id === req.user.id.toString()) {
    logger.warn('Admin attempted to delete themselves', { adminId: req.user.id });
    return res.status(403).json({
      success: false,
      error: 'Cannot delete your own account'
    });
  }

  await User.delete(req.params.id);

  logger.info('Admin deleted user', { 
    deletedUserId: req.params.id,
    deletedUsername: user.username,
    adminId: req.user.id 
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'User deleted successfully'
  });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};
