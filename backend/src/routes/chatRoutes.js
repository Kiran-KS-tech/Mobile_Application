const express = require('express');
const router = express.Router();
const { postChatMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/message', postChatMessage);
router.get('/history', getChatHistory);

module.exports = router;

