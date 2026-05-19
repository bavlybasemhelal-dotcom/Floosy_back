const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/activityLogsController');

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, validateObjectId, ctrl.getOne);

router.post(
  '/',
  auth,
  [
    body('memberId').notEmpty().withMessage('Member ID is required'),
    body('memberName').notEmpty().withMessage('Member name is required'),
    body('action').notEmpty().withMessage('Action is required'),
  ],
  handleValidation,
  ctrl.create
);

router.put('/:id', auth, validateObjectId, ctrl.update);
router.delete('/clear', auth, ctrl.clearAll);
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
