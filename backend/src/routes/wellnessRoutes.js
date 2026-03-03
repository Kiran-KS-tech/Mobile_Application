const express = require('express');
const router = express.Router();
const { getBurnoutStatus, getBurnoutRisk } = require('../controllers/wellnessController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getBurnoutStatus);
router.get('/burnout-risk', protect, getBurnoutRisk);

module.exports = router;
