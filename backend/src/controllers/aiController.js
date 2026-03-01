const Groq = require('groq-sdk');

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const chatWithAI = async (req, res) => {
    const { message, stressScore } = req.body;
    
    const MODEL_NAME = "llama-3.3-70b-versatile";

    try {
        const systemPrompt = `You are CalmX AI, a corporate burnout specialist.
Use empathetic listening and CBT. Actionable steps only.
The user currently has a stress score of ${stressScore}/100.
Provide relational advice for workplace conflict.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: MODEL_NAME,
            temperature: 0.7,
            max_tokens: 500,
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (apiError) {
        console.error('Groq API Error (aiController):', apiError.message);
        res.status(500).json({ message: 'Error communicating with AI' });
    }
};

module.exports = { chatWithAI };

