const express = require('express');
const router = express.Router();
const { getBurnoutStatus } = require('../controllers/wellnessController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getBurnoutStatus);

module.exports = router;
