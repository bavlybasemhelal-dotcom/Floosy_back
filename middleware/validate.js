const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Express-validator result handler.
 * Returns 400 with the first validation error if any exist.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      data: errors.array(),
    });
  }
  next();
};

/**
 * Validates that req.params.id is a valid MongoDB ObjectId.
 * Returns 400 if invalid.
 */
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      data: null,
    });
  }
  next();
};

module.exports = { handleValidation, validateObjectId };
