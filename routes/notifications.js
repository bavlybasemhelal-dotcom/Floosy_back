const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/notificationsController');

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, validateObjectId, ctrl.getOne);

router.post(
  '/',
  auth,
  [body('title').notEmpty().withMessage('Title is required')],
  handleValidation,
  ctrl.create
);

router.put('/:id', auth, validateObjectId, ctrl.update);
router.put('/:id/read', auth, validateObjectId, ctrl.markAsRead);
router.put('/read/all', auth, ctrl.markAllAsRead);
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
