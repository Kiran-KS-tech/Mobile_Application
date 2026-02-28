const { analyzeEmotion, generateSupportReply } = require('../services/chatService');

// In-memory history store keyed by user id.
// This keeps the implementation within controllers/services only,
// without introducing new database models.
const userChatHistory = new Map();

const postChatMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ message: 'Message is required' });
        }

        const analysis = analyzeEmotion(message);
        const reply = generateSupportReply(analysis);

        const createdAt = new Date();
        const entry = {
            id: `${req.user._id}-${createdAt.getTime()}`,
            message,
            reply,
            analysis,
            createdAt
        };

        const existing = userChatHistory.get(req.user._id.toString()) || [];
        existing.unshift(entry);
        userChatHistory.set(req.user._id.toString(), existing.slice(0, 200));

        return res.status(201).json(entry);
    } catch (error) {
        console.error('Error in postChatMessage:', error);
        return res.status(500).json({ message: 'Server error while processing chat message' });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 50;

        const history = userChatHistory.get(req.user._id.toString()) || [];
        return res.json(history.slice(0, limit));
    } catch (error) {
        console.error('Error in getChatHistory:', error);
        return res.status(500).json({ message: 'Server error while fetching chat history' });
    }
};

module.exports = {
    postChatMessage,
    getChatHistory
};

