const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout
} = require('../controllers/authController');

const { protect, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(30).alphanum(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')),
  role: Joi.string().valid('user', 'admin').default('user')
});

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
});

const updateDetailsSchema = Joi.object({
  username: Joi.string().min(3).max(30).alphanum().optional(),
  email: Joi.string().email().optional()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
});

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', optionalAuth, logout);  // Changed to POST and optional auth
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, validateRequest(updateDetailsSchema), updateDetails);
router.put('/updatepassword', protect, validateRequest(updatePasswordSchema), updatePassword);

module.exports = router;
