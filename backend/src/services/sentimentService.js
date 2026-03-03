const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Analyzes the sentiment of a message and returns a predicted mood score and stress level.
 * @param {string} text - The user's message.
 * @returns {Promise<{score: number, stressLevel: string}>}
 */
const analyzeSentiment = async (text) => {
    try {
        const prompt = `Analyze the emotional sentiment and workplace stress level of this message: "${text}"
        Return JSON ONLY: { "score": 0-100, "stressLevel": "Low"|"Medium"|"High" }
        - 100 score means very positive/calm.
        - 0 score means extremely stressed/burnt out.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, // Low temperature for consistent JSON
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return {
            score: result.score || 50,
            stressLevel: result.stressLevel || "Medium"
        };
    } catch (error) {
        console.error('Sentiment Analysis Error:', error.message);
        return { score: 50, stressLevel: "Medium" };
    }
};

module.exports = { analyzeSentiment };
