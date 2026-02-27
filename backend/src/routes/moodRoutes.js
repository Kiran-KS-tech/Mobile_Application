const express = require('express');
const router = express.Router();
const { logMood, getMoodHistory } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/log', logMood);
router.get('/', getMoodHistory);

module.exports = router;
