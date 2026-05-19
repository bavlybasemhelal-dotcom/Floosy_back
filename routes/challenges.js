const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/challengesController');

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, validateObjectId, ctrl.getOne);

router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('target').isNumeric().withMessage('Target must be a number'),
    body('deadline').notEmpty().withMessage('Deadline is required'),
  ],
  handleValidation,
  ctrl.create
);

router.put('/:id', auth, validateObjectId, ctrl.update);
router.put('/:id/checkin', auth, validateObjectId, ctrl.checkIn);
router.put('/:id/reset', auth, validateObjectId, ctrl.resetChallenge);
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
