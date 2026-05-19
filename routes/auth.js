const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { signup, login } = require('../controllers/authController');

router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  handleValidation,
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  login
);

module.exports = router;
