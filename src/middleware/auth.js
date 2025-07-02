const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const logger = require('../config/logger');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies (if you want to support cookie auth)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    logger.warn('Access denied - No token provided', {
      ip: req.ip,
      url: req.url,
      userAgent: req.get('User-Agent')
    });

    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  // Check if token is blacklisted
  const isBlacklisted = await TokenBlacklist.isTokenBlacklisted(token);
  if (isBlacklisted) {
    logger.warn('Access denied - Token is blacklisted', {
      ip: req.ip,
      url: req.url
    });

    return res.status(401).json({
      success: false,
      error: 'Access denied. Token is no longer valid.'
    });
  }

  try {
    // Verify token
    const decoded = User.verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      logger.warn('Access denied - User not found', {
        userId: decoded.userId,
        ip: req.ip
      });

      return res.status(401).json({
        success: false,
        error: 'Access denied. User not found.'
      });
    }

    // Add user to request object
    req.user = user;
    
    logger.debug('User authenticated successfully', {
      userId: user.id,
      username: user.username,
      role: user.role
    });

    next();
  } catch (error) {
    logger.warn('Access denied - Invalid token', {
      error: error.message,
      ip: req.ip,
      url: req.url
    });

    return res.status(401).json({
      success: false,
      error: 'Access denied. Invalid token.'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Please log in.'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Access denied - Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.url
      });

      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }

    logger.debug('User authorized', {
      userId: req.user.id,
      role: req.user.role,
      action: req.url
    });

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = User.verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      logger.debug('Optional auth failed', { error: error.message });
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};
