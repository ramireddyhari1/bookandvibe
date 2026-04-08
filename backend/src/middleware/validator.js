const Joi = require('joi');

/**
 * Generic Validation Middleware
 * @param {Joi.Schema} schema 
 */
const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body, { 
    abortEarly: false, // Include all errors, not just the first one
    stripUnknown: true, // Remove keys not in the schema
    errors: {
      wrap: {
        label: ''
      }
    }
  });

  if (error) {
    const errorDetails = error.details.map(detail => detail.message);
    return res.status(400).json({ 
      error: 'Validation Failed', 
      details: errorDetails 
    });
  }

  // Update req.body with the sanitized/validated value
  req.body = value;
  next();
};

// --- Auth Schemas ---

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().min(8).max(32).required()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')) // Example: at least letters and numbers
    .messages({
      'string.pattern.base': 'Password must contain only alphanumeric characters for this demo.',
      'string.min': 'Password must be at least 8 characters long.'
    })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required()
});

// --- Booking Schemas ---

const seatLockSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  seatNumbers: Joi.array().items(Joi.string().uppercase().pattern(/^([A-Z]+)(\d+)$/)).min(1).required()
});

const bookingConfirmSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  seatNumbers: Joi.array().items(Joi.string().uppercase().pattern(/^([A-Z]+)(\d+)$/)).min(1).required(),
  totalAmount: Joi.number().min(0).optional(), // We'll recalculate this on the server anyway
  paymentMethod: Joi.string().valid('UPI', 'CARD', 'NETBANKING', 'MOCK').default('MOCK'),
  idempotencyKey: Joi.string().min(8).optional()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  seatLockSchema,
  bookingConfirmSchema
};
