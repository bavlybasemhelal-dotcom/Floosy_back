const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/categoriesController');

// GET all: returns global defaults + user's custom categories
router.get('/', auth, ctrl.getAll);

// GET one by ID
router.get('/:id', auth, validateObjectId, ctrl.getOne);

// POST: create a new user-specific category
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Category name is required'),
    body('iconCode').isNumeric().withMessage('Icon code is required'),
    body('colorValue').isNumeric().withMessage('Color value is required'),
  ],
  handleValidation,
  ctrl.create
);

// PUT: update a user-created category (cannot edit defaults)
router.put('/:id', auth, validateObjectId, ctrl.update);

// DELETE: delete a user-created category (cannot delete defaults)
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
