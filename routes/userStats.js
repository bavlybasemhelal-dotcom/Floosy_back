const router = require('express').Router();
const auth = require('../middleware/auth');
const { getStats, updateStats } = require('../controllers/userStatsController');

router.get('/', auth, getStats);
router.put('/', auth, updateStats);

module.exports = router;
