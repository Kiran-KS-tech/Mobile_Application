const express = require('express');
const router = express.Router();
const { logMood, getMoodHistory, getMoodAnalytics } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/log', logMood);
router.get('/history', getMoodHistory);
// Backwards compatibility with existing `/api/mood` history route
router.get('/', getMoodHistory);
router.get('/analytics', getMoodAnalytics);

module.exports = router;
