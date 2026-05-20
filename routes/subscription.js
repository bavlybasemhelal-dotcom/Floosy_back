const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  activate,
  cancel,
  activateTrial,
  getStatus,
  getCoupons,
  redeemCoupon,
} = require('../controllers/subscriptionController');

router.get('/status', auth, getStatus);
router.post('/activate', auth, activate);
router.post('/cancel', auth, cancel);
router.post('/trial', auth, activateTrial);
router.get('/coupons', auth, getCoupons);
router.post('/redeem-coupon', auth, redeemCoupon);

module.exports = router;
