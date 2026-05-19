const router = require('express').Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile, findByEmail } = require('../controllers/usersController');

router.get('/me', auth, getProfile);
router.get('/search', auth, findByEmail);
router.put('/me', auth, updateProfile);

module.exports = router;
