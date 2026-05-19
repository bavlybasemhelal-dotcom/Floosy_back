const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/supportRequestsController');

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, validateObjectId, ctrl.getOne);

router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('type').notEmpty().withMessage('Request type is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  handleValidation,
  ctrl.create
);

router.put('/:id', auth, validateObjectId, ctrl.update);
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
