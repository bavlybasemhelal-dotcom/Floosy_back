const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { handleValidation, validateObjectId } = require('../middleware/validate');
const ctrl = require('../controllers/productOffersController');

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, validateObjectId, ctrl.getOne);

router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('originalPrice').isNumeric().withMessage('Original price must be a number'),
    body('discountedPrice').isNumeric().withMessage('Discounted price must be a number'),
    body('storeName').notEmpty().withMessage('Store name is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  handleValidation,
  ctrl.create
);

router.put('/:id', auth, validateObjectId, ctrl.update);
router.delete('/:id', auth, validateObjectId, ctrl.deleteOne);

module.exports = router;
