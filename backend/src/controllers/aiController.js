const Groq = require('groq-sdk');
const User = require('../models/User');
const Mood = require('../models/Mood');
const Timer = require('../models/Timer');

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
const getMoodFeedback = async (req, res) => {
    const { mood, score, stressLevel, energyLevel, note } = req.body;
    
    try {
        const prompt = `User just logged their mood:
        Mood: ${mood} (Score: ${score}/5)
        Stress: ${stressLevel}/10, Energy: ${energyLevel}/10
        Note: ${note || "None"}
        
        Provide a 1-sentence empathetic response and 1 small actionable wellness tip.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: "You are a wellness coach. Be empathetic and concise." }, { role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 150,
        });

        res.json({ feedback: completion.choices[0].message.content });
    } catch (error) {
        console.error('Mood Feedback Error:', error.message);
        res.status(500).json({ message: 'Error generating feedback' });
    }
};

const getBurnoutRiskAnalytics = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 1. Fetch all users
        const users = await User.find({ role: 'employee' }).select('name email');

        // 2. Fetch mood and attendance data for all users in the last 7 days
        const moodData = await Mood.find({ 
            createdAt: { $gte: sevenDaysAgo } 
        }).populate('user', 'name');

        const attendanceData = await Timer.find({
            checkInTime: { $gte: sevenDaysAgo }
        }).populate('userId', 'name');

        // 3. Format data for AI
        const dataSummary = users.map(user => {
            const userIdStr = user._id.toString();
            
            const userMoods = moodData.filter(m => m.user && m.user._id && m.user._id.toString() === userIdStr);
            const userAttendance = attendanceData.filter(a => a.userId && a.userId._id && a.userId._id.toString() === userIdStr);

            return {
                name: user.name,
                avgMoodScore: userMoods.length > 0 ? userMoods.reduce((sum, m) => sum + m.score, 0) / userMoods.length : 'N/A',
                stressLevels: userMoods.map(m => m.stressLevel),
                notes: userMoods.map(m => m.note).filter(n => n),
                totalWorkSeconds: userAttendance.reduce((sum, a) => sum + (a.duration || 0), 0),
                daysActive: new Set(userAttendance.map(a => a.dateString)).size
            };
        });

        const systemPrompt = `You are an HR Burnout Specialist AI. 
Analyze the provided weekly employee data (mood scores, stress levels, notes, and attendance) to identify burnout risks.
Risk Levels: High, Medium, Low.
Return a JSON array of objects with fields: "name", "riskLevel", "reason", "recommendation".
Only include employees with Medium or High risk. If no one is at risk, return an empty array [].
Be concise in your reasons and recommendations.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: JSON.stringify(dataSummary) }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        console.log('AI Data Summary Sent:', JSON.stringify(dataSummary, null, 2));
        let result = completion.choices[0].message.content;
        console.log('AI Raw Response:', result);
        try {
            const parsed = JSON.parse(result);
            // Handle if model returns { "employees": [...] } vs [...]
            const riskData = parsed.employees || parsed.risks || (Array.isArray(parsed) ? parsed : Object.values(parsed)[0]);
            res.json(Array.isArray(riskData) ? riskData : []);
        } catch (e) {
            console.error('Error parsing AI response:', e);
            res.status(500).json({ message: 'Error analyzing burnout risk' });
        }

    } catch (error) {
        console.error('Burnout Risk Error:', error.message);
        res.status(500).json({ message: 'Error generating burnout analytics' });
    }
};

module.exports = { chatWithAI, getMoodFeedback, getBurnoutRiskAnalytics };

