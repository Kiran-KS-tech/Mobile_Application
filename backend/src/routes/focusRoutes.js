const express = require('express');
const router = express.Router();
const {
    startFocusSession,
    endFocusSession,
    getFocusStats,
    getSessions,
    logSession
} = require('../controllers/focusController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/start', startFocusSession);
router.post('/end', endFocusSession);
router.get('/stats', getFocusStats);
router.get('/sessions', getSessions);
router.post('/sessions', logSession);

module.exports = router;

