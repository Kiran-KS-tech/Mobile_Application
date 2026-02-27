const axios = require('axios');

const chatWithAI = async (req, res) => {
    const { message, stressScore } = req.body;

    try {
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: `You are CalmX AI, a psychological resource assistant specialized in corporate burnout. 
                    The user currently has a stress score of ${stressScore}/100. 
                    Use empathetic listening and Cognitive Behavioral Therapy (CBT) techniques to offer actionable steps. 
                    Provide relational advice if they mention workplace conflict.`
                },
                { role: "user", content: message }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error('DeepSeek API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error communicating with AI' });
    }
};

module.exports = { chatWithAI };
