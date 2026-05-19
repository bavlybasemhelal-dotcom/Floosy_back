const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/categoryLocksController');

// List all category locks (auto-seeds defaults for new users)
router.get('/', auth, ctrl.getAll);

// Get a specific category lock by ID
router.get('/:id', auth, validateObjectId, ctrl.getOne);

// Create a new custom category lock
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('target').isNumeric().withMessage('Target must be a number'),
  ],
  handleValidation,
  ctrl.create
);

// Update a category lock
router.put('/:id', auth, validateObjectId, ctrl.update);

// Unlock a category lock
router.put('/:id/unlock', auth, validateObjectId, ctrl.unlock);

// Increment progress for a category lock
router.put('/:id/progress', auth, validateObjectId, ctrl.updateProgress);

// Force sync all category totals from actual expenses
router.post('/sync', auth, ctrl.syncTotals);

// Delete a category lock
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
