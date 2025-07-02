const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../config/logger');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  logger.info('User registration attempt', { username, email });

  // Check if user already exists
  const existingUserByEmail = await User.findByEmail(email);
  if (existingUserByEmail) {
    logger.warn('Registration failed - Email already exists', { email });
    return res.status(400).json({
      success: false,
      error: 'User with this email already exists'
    });
  }

  const existingUserByUsername = await User.findByUsername(username);
  if (existingUserByUsername) {
    logger.warn('Registration failed - Username already exists', { username });
    return res.status(400).json({
      success: false,
      error: 'Username already taken'
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    role: role || 'user' // Default to 'user' role
  });

  // Generate token
  const token = User.generateToken(user.id, user.role);

  logger.info('User registered successfully', {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  logger.info('User login attempt', { email });

  // Validate email & password
  if (!email || !password) {
    logger.warn('Login failed - Missing credentials', { email });
    return res.status(400).json({
      success: false,
      error: 'Please provide an email and password'
    });
  }

  // Check for user
  const user = await User.findByEmail(email);

  if (!user) {
    logger.warn('Login failed - User not found', { email });
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isMatch = await User.comparePassword(password, user.password);

  if (!isMatch) {
    logger.warn('Login failed - Invalid password', {
      userId: user.id,
      email
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Update last login
  await User.updateLastLogin(user.id);

  // Generate token
  const token = User.generateToken(user.id, user.role);

  logger.info('User logged in successfully', {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  logger.debug('Get current user', { userId: user.id });

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login
    }
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  logger.info('Updating user details', {
    userId: req.user.id,
    fields: Object.keys(fieldsToUpdate)
  });

  const user = await User.update(req.user.id, fieldsToUpdate);

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Please provide current and new password'
    });
  }

  logger.info('Password update attempt', { userId: req.user.id });

  // Get user with password
  const user = await User.findByEmail(req.user.email);

  // Check current password
  const isMatch = await User.comparePassword(currentPassword, user.password);

  if (!isMatch) {
    logger.warn('Password update failed - Current password incorrect', {
      userId: req.user.id
    });
    return res.status(401).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  await User.update(req.user.id, { password: newPassword });

  // Blacklist all existing tokens when password changes
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    
    if (token) {
      try {
        await TokenBlacklist.blacklistToken(token, req.user.id, 'password_change');
        logger.info('Token blacklisted after password change', {
          userId: req.user.id
        });
      } catch (error) {
        logger.error('Failed to blacklist token after password change', {
          error: error.message,
          userId: req.user.id
        });
      }
    }
  }

  logger.info('Password updated successfully', { userId: req.user.id });

  res.status(200).json({
    success: true,
    data: { message: 'Password updated successfully' }
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public (with optional auth)
const logout = asyncHandler(async (req, res) => {
  let token;

  // Extract token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If user is authenticated, log the logout with user info
  if (req.user) {
    logger.info('User logged out', {
      userId: req.user.id,
      username: req.user.username
    });
  } else {
    logger.info('Logout attempt', {
      ip: req.ip,
      hasToken: !!token
    });
  }

  // Blacklist the token if present
  if (token) {
    try {
      await TokenBlacklist.blacklistToken(token, req.user?.id, 'logout');
      logger.debug('Token blacklisted in database', {
        userId: req.user?.id,
        tokenPrefix: token.substring(0, 10) + '...'
      });
    } catch (error) {
      logger.error('Failed to blacklist token', {
        error: error.message,
        userId: req.user?.id
      });
      // Continue with logout even if blacklisting fails
    }
  }

  // Clear cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only in production
    sameSite: 'strict'
  });

  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout
};
