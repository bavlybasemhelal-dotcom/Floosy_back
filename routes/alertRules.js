const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/alertRulesController');

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, validateObjectId, ctrl.getOne);

router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('type').isNumeric().withMessage('Type is required'),
    body('threshold').isNumeric().withMessage('Threshold must be a number'),
  ],
  handleValidation,
  ctrl.create
);

router.put('/:id', auth, validateObjectId, ctrl.update);
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
