const Mood = require('../models/Mood');
const Timer = require('../models/Timer');

/**
 * Predicts burnout risk for a user based on recent data.
 * @param {string} userId - The user's ID.
 * @returns {Promise<{riskLevel: string, factors: string[]}>}
 */
const predictBurnout = async (userId) => {
    try {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        // 1. Check Mood Trends
        const moods = await Mood.find({ 
            user: userId, 
            createdAt: { $gte: lastWeek } 
        }).sort({ createdAt: -1 });

        const avgScore = moods.length > 0 
            ? moods.reduce((acc, m) => acc + m.score, 0) / moods.length 
            : 70;

        // 2. Check Overtime/Attendance (Using Timer model)
        const dateStringLimit = lastWeek.toISOString().split('T')[0];
        const timers = await Timer.find({
            userId: userId,
            dateString: { $gte: dateStringLimit }
        });

        // Simulating overtime detection (e.g., frequent sessions or long durations)
        const overtimeDays = new Set(timers.map(t => t.dateString)).size; 
        // Note: The logic above is a placeholder. More complex logic could sum durations per day.

        // 3. Check Task Load (Skipped as tasks are in-memory)
        const pendingTasks = 0; 

        let riskLevel = 'Low';
        let factors = [];

        if (avgScore < 40) {
            riskLevel = 'High';
            factors.push('Consistently low mood/high stress');
        } else if (avgScore < 60) {
            riskLevel = 'Medium';
            factors.push('Declining mood levels');
        }

        if (overtimeDays >= 5) {
            riskLevel = (riskLevel === 'Low') ? 'Medium' : 'High';
            factors.push('Frequent high workload across the week');
        }

        return { riskLevel, factors };
    } catch (error) {
        console.error('Burnout Prediction Error:', error.message);
        return { riskLevel: 'Unknown', factors: [] };
    }
};

module.exports = { predictBurnout };
