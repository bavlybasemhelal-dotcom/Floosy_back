const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/sharedMembersController');

// Invitation endpoints (must be before /:id routes)
router.get('/invitations', auth, ctrl.getInvitations);
router.post('/invitations/:id/accept', auth, validateObjectId, ctrl.acceptInvitation);

// CRUD
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('contact').notEmpty().withMessage('Contact is required'),
    body('relationship').isNumeric().withMessage('Relationship is required'),
  ],
  handleValidation,
  ctrl.create
);

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, validateObjectId, ctrl.getOne);

router.put('/:id', auth, validateObjectId, ctrl.update);
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
