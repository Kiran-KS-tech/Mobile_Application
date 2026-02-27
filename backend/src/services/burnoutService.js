const Mood = require('../models/Mood');

const analyzeBurnout = async (userId) => {
    // Get last 7 days of mood logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const moods = await Mood.find({
        user: userId,
        createdAt: { $gte: sevenDaysAgo }
    });

    if (moods.length === 0) return { risk: 'Unknown', message: 'Not enough data.' };

    const averageScore = moods.reduce((acc, mood) => acc + mood.score, 0) / moods.length;
    const highStressInstances = moods.filter(m => m.stressLevel === 'High').length;

    let risk = 'Low';
    let message = 'Your stress levels are within a healthy range.';

    if (averageScore > 50 || highStressInstances >= 2) {
        risk = 'Medium';
        message = 'You are showing early signs of burnout. Consider taking frequent breaks.';
    }

    if (averageScore > 75 || highStressInstances >= 4) {
        risk = 'High';
        message = 'CRITICAL: High burnout risk detected. We recommend blocking "Focus Time" and consulting with HR or a professional.';
    }

    return { risk, averageScore, highStressInstances, message };
};

module.exports = { analyzeBurnout };
