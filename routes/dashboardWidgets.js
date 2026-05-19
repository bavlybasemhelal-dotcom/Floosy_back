const router = require('express').Router();
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/dashboardWidgetsController');

// List / get widgets config for the user
router.get('/', auth, ctrl.getAll);

// Get a specific widget config by ID
router.get('/:id', auth, validateObjectId, ctrl.getOne);

// Create widget config (upserts by userId)
router.post('/', auth, ctrl.create);

// Update widget config without ID (by userId)
router.put('/', auth, ctrl.updateWidgets);

// Update widget config by specific ID
router.put('/:id', auth, validateObjectId, ctrl.update);

// Delete widget config by ID
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
