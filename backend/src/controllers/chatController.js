const Groq = require('groq-sdk');
const Mood = require('../models/Mood');
const Chat = require('../models/Chat');

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL_NAME = "llama-3.3-70b-versatile"; 

const CRISIS_KEYWORDS = [
    'suicide', 'self-harm', 'killing myself', 'want to die', 'end my life', 'hurt myself',
    'cut myself', 'take my life', 'better off dead'
];

const checkCrisis = (text) => {
    const lowercaseText = text.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => lowercaseText.includes(keyword));
};

const postChatMessage = async (req, res) => {
    try {
        const { content: message } = req.body; 

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ message: 'Message is required' });
        }

        const userId = req.user._id;

        // 1. Detect Crisis
        if (checkCrisis(message)) {
            const crisisResponse = "I'm worried about what you just said. You don't have to go through this alone. Please reach out to a professional or a crisis helpline immediately. In many countries, you can call or text 988 for support.";
            
            let chatEntry = await Chat.findOne({ user: userId });
            if (!chatEntry) chatEntry = new Chat({ user: userId, messages: [] });
            
            const userMsg = { role: 'user', content: message, timestamp: new Date() };
            const aiMsg = { role: 'assistant', content: crisisResponse, timestamp: new Date() };
            
            chatEntry.messages.push(userMsg, aiMsg);
            await chatEntry.save();

            return res.status(201).json({ 
                userMessage: chatEntry.messages[chatEntry.messages.length - 2], 
                aiMessage: chatEntry.messages[chatEntry.messages.length - 1] 
            });
        }

        // 2. Build User Context from Mood
        const latestMood = await Mood.findOne({ user: userId }).sort({ createdAt: -1 });
        const contextString = latestMood 
            ? `Mood: ${latestMood.score}/100, Stress: ${latestMood.stressLevel}`
            : "No recent mood data.";

        const systemPrompt = `You are CalmX AI, a psychological resource assistant specialized in workplace wellness and corporate burnout.
Core Directives:
- Use Cognitive Behavioral Therapy (CBT) and empathetic listening.
- Keep responses concise, warm, and actionable.
- User Context: ${contextString}
- Strategy: Validating the user's feelings first, then offer supportive steps.
- Role: You are an AI assistant, not a doctor. Mention professional help if distress is high.`;

        // 3. Get Persistent Chat History
        let chatEntry = await Chat.findOne({ user: userId });
        if (!chatEntry) chatEntry = new Chat({ user: userId, messages: [] });

        const messagesForAI = [
            { role: "system", content: systemPrompt },
            ...chatEntry.messages.slice(-10).map(m => ({ 
                role: m.role === 'assistant' ? 'assistant' : 'user', 
                content: m.content 
            })),
            { role: "user", content: message }
        ];

        // 4. Call Groq API
        let aiReply = "";
        try {
            const completion = await groq.chat.completions.create({
                messages: messagesForAI,
                model: MODEL_NAME,
                temperature: 0.7,
                max_tokens: 500,
            });
            aiReply = completion.choices[0].message.content;
        } catch (apiError) {
            console.error('Groq API Error:', apiError.message);
            aiReply = "I'm having a little trouble connecting with the AI right now, but I'm here. How can I support you?";
        }

        // 5. Save to MongoDB
        const newUserMsg = { role: 'user', content: message, timestamp: new Date() };
        const newAiMsg = { role: 'assistant', content: aiReply, timestamp: new Date() };
        
        chatEntry.messages.push(newUserMsg, newAiMsg);
        await chatEntry.save();

        // 6. Return response with stable IDs
        return res.status(201).json({ 
            userMessage: chatEntry.messages[chatEntry.messages.length - 2], 
            aiMessage: chatEntry.messages[chatEntry.messages.length - 1] 
        });

    } catch (error) {
        console.error('Error in postChatMessage:', error);
        return res.status(500).json({ message: 'Internal server error processing chat' });
    }
};

const getChatHistory = async (req, res) => {
    try {
        let chatEntry = await Chat.findOne({ user: req.user._id });
        if (!chatEntry) return res.json([]);
        return res.json(chatEntry.messages);
    } catch (error) {
        console.error('Error in getChatHistory:', error);
        return res.status(500).json({ message: 'Error fetching history' });
    }
};

module.exports = { postChatMessage, getChatHistory };

