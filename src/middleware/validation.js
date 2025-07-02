const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

// Book validation schemas
const bookSchemas = {
  create: Joi.object({
    title: Joi.string().required().min(1).max(255),
    author: Joi.string().required().min(1).max(255),
    isbn: Joi.string().optional().pattern(/^[0-9\-X]+$/),
    category_id: Joi.number().integer().positive().optional(),
    description: Joi.string().optional(),
    published_year: Joi.number().integer().min(1000).max(new Date().getFullYear()),
    pages: Joi.number().integer().positive().optional(),
    total_copies: Joi.number().integer().positive().default(1),
    available_copies: Joi.number().integer().min(0).optional()
  }),
  
  update: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    author: Joi.string().min(1).max(255).optional(),
    isbn: Joi.string().pattern(/^[0-9\-X]+$/).optional(),
    category_id: Joi.number().integer().positive().optional(),
    description: Joi.string().optional(),
    published_year: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
    pages: Joi.number().integer().positive().optional(),
    total_copies: Joi.number().integer().positive().optional(),
    available_copies: Joi.number().integer().min(0).optional()
  })
};

// Category validation schemas
const categorySchemas = {
  create: Joi.object({
    name: Joi.string().required().min(1).max(100),
    description: Joi.string().optional()
  }),
  
  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().optional()
  })
};

module.exports = {
  validateRequest,
  bookSchemas,
  categorySchemas
};
