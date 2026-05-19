const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/billsController');

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, validateObjectId, ctrl.getOne);

router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Bill name is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
  ],
  handleValidation,
  ctrl.create
);

router.put('/:id', auth, validateObjectId, ctrl.update);
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
