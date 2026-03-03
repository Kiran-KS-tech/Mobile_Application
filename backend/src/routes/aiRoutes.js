const express = require('express');
const router = express.Router();
const { chatWithAI, getMoodFeedback, getBurnoutRiskAnalytics } = require('../controllers/aiController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/chat', protect, chatWithAI);
router.post('/mood-feedback', protect, getMoodFeedback);
router.get('/admin/burnout-risk', protect, admin, getBurnoutRiskAnalytics);

module.exports = router;
