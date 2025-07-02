const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const Joi = require('joi');

// User validation schemas
const createUserSchema = Joi.object({
  username: Joi.string().required().min(3).max(30).alphanum(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')),
  role: Joi.string().valid('user', 'admin', 'super_admin').default('user')
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).alphanum().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).optional(),
  role: Joi.string().valid('user', 'admin', 'super_admin').optional()
});

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.route('/')
  .get(getUsers)
  .post(validateRequest(createUserSchema), createUser);

router.route('/:id')
  .get(getUser)
  .put(validateRequest(updateUserSchema), updateUser)
  .delete(deleteUser);

module.exports = router;
