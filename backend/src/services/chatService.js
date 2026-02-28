const analyzeEmotion = (message) => {
    const text = (message || '').toLowerCase();

    const negativeKeywords = [
        'stressed',
        'overwhelmed',
        'burnout',
        'burned out',
        'anxious',
        'anxiety',
        'tired',
        'exhausted',
        'depressed',
        'sad',
        'angry',
        'frustrated',
        'panic'
    ];

    const positiveKeywords = [
        'grateful',
        'happy',
        'excited',
        'motivated',
        'energized',
        'calm',
        'relaxed',
        'confident',
        'hopeful'
    ];

    let score = 0;
    const tags = [];

    negativeKeywords.forEach((kw) => {
        if (text.includes(kw)) {
            score -= 1;
            tags.push(kw);
        }
    });

    positiveKeywords.forEach((kw) => {
        if (text.includes(kw)) {
            score += 1;
            tags.push(kw);
        }
    });

    let sentiment = 'neutral';
    if (score <= -2) sentiment = 'very-negative';
    else if (score === -1) sentiment = 'negative';
    else if (score === 1) sentiment = 'positive';
    else if (score >= 2) sentiment = 'very-positive';

    let primaryEmotion = 'neutral';
    if (text.includes('overwhelmed') || text.includes('burnout') || text.includes('burned out')) {
        primaryEmotion = 'overwhelmed';
    } else if (text.includes('anxious') || text.includes('anxiety') || text.includes('panic')) {
        primaryEmotion = 'anxious';
    } else if (text.includes('tired') || text.includes('exhausted')) {
        primaryEmotion = 'tired';
    } else if (text.includes('sad') || text.includes('depressed')) {
        primaryEmotion = 'sad';
    } else if (text.includes('angry') || text.includes('frustrated')) {
        primaryEmotion = 'frustrated';
    } else if (text.includes('grateful') || text.includes('thank you')) {
        primaryEmotion = 'grateful';
    } else if (text.includes('excited') || text.includes('motivated')) {
        primaryEmotion = 'motivated';
    } else if (text.includes('calm') || text.includes('relaxed')) {
        primaryEmotion = 'calm';
    }

    const confidence = Math.min(1, Math.abs(score) / 5 + 0.3);

    return {
        sentiment,
        primaryEmotion,
        confidence,
        tags,
        rawScore: score
    };
};

const generateSupportReply = (mood) => {
    const analysis = typeof mood === 'string' ? { primaryEmotion: mood } : mood || {};
    const primaryEmotion = analysis.primaryEmotion || 'neutral';

    switch (primaryEmotion) {
        case 'overwhelmed':
            return (
                "It sounds like you're carrying a lot right now. " +
                'Let’s break things into smaller, manageable steps. ' +
                'Try listing your top 3 priorities for today and ruthlessly postpone anything that isn’t essential. ' +
                'It is completely okay to set boundaries and say no.'
            );
        case 'anxious':
            return (
                "I'm noticing a lot of anxiety in what you shared. " +
                'Start with a simple grounding exercise: slowly inhale for 4 seconds, hold for 4, and exhale for 6. ' +
                'Write down the specific worries you have, and next to each, add one concrete action you can take. ' +
                'You are allowed to move at a sustainable pace.'
            );
        case 'tired':
            return (
                'Your mind and body sound exhausted. ' +
                'If possible, schedule a true 15–20 minute break away from screens and notifications. ' +
                'Consistent rest is not laziness; it is maintenance. ' +
                'Small micro‑breaks across the day often reduce burnout risk more than one long weekend.'
            );
        case 'sad':
            return (
                'I’m sorry you’re feeling low. ' +
                'You don’t need to “fix” everything at once. ' +
                'Try one gentle action that usually improves your mood slightly—like a walk, journaling, or talking to someone you trust. ' +
                'If this low mood persists, consider reaching out to a professional for additional support.'
            );
        case 'frustrated':
            return (
                'Your frustration is valid. ' +
                'Before reacting, try to capture what specifically feels unfair or out of your control. ' +
                'Then separate what you can influence (conversations, boundaries, expectations) from what you cannot. ' +
                'Clear, calm communication about your limits can often shift difficult dynamics over time.'
            );
        case 'grateful':
            return (
                'It’s great to hear moments of gratitude. ' +
                'You can reinforce this by writing down three small things you appreciate today. ' +
                'This doesn’t erase stress, but it can build psychological resilience over time.'
            );
        case 'motivated':
            return (
                'You’re feeling a healthy drive right now. ' +
                'Channel it by choosing one high‑impact task and protecting a focused block of time for it. ' +
                'Avoid over‑loading your schedule just because you have energy in this moment—future you will thank you.'
            );
        case 'calm':
            return (
                'Being in a calm state is a great place to design better routines. ' +
                'This might be a good time to plan focus blocks, breaks, and recovery activities for the week ahead.'
            );
        default:
            return (
                "Thank you for sharing that. I'm here to support you. " +
                'Try to notice what your body is asking for right now: rest, movement, connection, or focus. ' +
                'Small, consistent adjustments to workload, sleep, and breaks can meaningfully reduce burnout risk over time.'
            );
    }
};

// Optional Socket.io integration hook – can be wired from server.js
const registerChatSocketHandlers = (io, ChatMessageModel) => {
    if (!io) return;

    io.on('connection', (socket) => {
        socket.on('chat:message', async (payload) => {
            try {
                const { userId, message } = payload || {};
                if (!message || !userId) {
                    return;
                }

                const analysis = analyzeEmotion(message);
                const reply = generateSupportReply(analysis);

                if (ChatMessageModel) {
                    await ChatMessageModel.create({
                        user: userId,
                        userMessage: message,
                        reply,
                        sentiment: analysis.sentiment,
                        primaryEmotion: analysis.primaryEmotion,
                        analysis
                    });
                }

                socket.emit('chat:reply', {
                    message,
                    reply,
                    analysis,
                    createdAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Socket chat:message error', error);
            }
        });
    });
};

module.exports = {
    analyzeEmotion,
    generateSupportReply,
    registerChatSocketHandlers
};

