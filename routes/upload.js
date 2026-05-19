const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { saveUrl } = require('../controllers/uploadController');

router.post(
  '/save-url',
  auth,
  [
    body('imageUrl').notEmpty().withMessage('imageUrl is required'),
    body('type').notEmpty().withMessage('type is required'),
  ],
  handleValidation,
  saveUrl
);

module.exports = router;
