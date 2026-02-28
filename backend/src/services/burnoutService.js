const Mood = require('../models/Mood');
const {
    listEvents,
    calculateWorkload,
    detectMeetingOverload
} = require('./calendarService');
const { listTasks } = require('./taskService');

const analyzeBurnoutFromMoodOnly = async (userId) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const moods = await Mood.find({
        user: userId,
        createdAt: { $gte: sevenDaysAgo }
    });

    if (moods.length === 0) return { risk: 'Unknown', message: 'Not enough data.' };

    const averageScore = moods.reduce((acc, mood) => acc + mood.score, 0) / moods.length;
    const highStressInstances = moods.filter((m) => m.stressLevel === 'High').length;

    let risk = 'Low';
    let message = 'Your stress levels are within a healthy range.';

    if (averageScore > 50 || highStressInstances >= 2) {
        risk = 'Medium';
        message = 'You are showing early signs of burnout. Consider taking frequent breaks.';
    }

    if (averageScore > 75 || highStressInstances >= 4) {
        risk = 'High';
        message =
            'CRITICAL: High burnout risk detected. We recommend blocking "Focus Time" and consulting with HR or a professional.';
    }

    return { risk, averageScore, highStressInstances, message };
};

const analyzeBurnout = async (userId) => {
    return analyzeBurnoutFromMoodOnly(userId);
};

const analyzeCompositeBurnout = async (userId, { focusStats } = {}) => {
    const moodOnly = await analyzeBurnoutFromMoodOnly(userId);

    const today = new Date();
    const calendarEvents = await listEvents(userId, { day: today });
    const workload = calculateWorkload(calendarEvents, today);
    const overload = detectMeetingOverload(calendarEvents, today);

    const tasks = await listTasks(userId);
    const openTasks = tasks.filter((t) => !t.completed);
    const highPriorityOpen = openTasks.filter(
        (t) => (t.priority || '').toLowerCase() === 'high' || (t.priority || '').toLowerCase() === 'critical'
    );

    const effectiveFocusMinutes = focusStats ? focusStats.totalFocusMinutes || 0 : 0;

    let burnoutRiskScore = 0;

    if (moodOnly.averageScore !== undefined) {
        burnoutRiskScore += (moodOnly.averageScore / 100) * 40;
    }

    burnoutRiskScore += Math.min(30, (workload.hours / 8) * 30);

    const taskLoadFactor = Math.min(30, highPriorityOpen.length * 3);
    burnoutRiskScore += taskLoadFactor;

    const focusProtection = Math.min(20, effectiveFocusMinutes / 10);
    burnoutRiskScore = Math.max(0, burnoutRiskScore - focusProtection);

    burnoutRiskScore = Math.max(0, Math.min(100, Math.round(burnoutRiskScore)));

    let level = 'Low';
    if (burnoutRiskScore >= 40 && burnoutRiskScore < 70) level = 'Medium';
    if (burnoutRiskScore >= 70) level = 'High';

    const breakGaps = {
        recommendedMicroBreakMinutes: 5,
        recommendedMacroBreakMinutes: 20
    };

    return {
        burnoutRisk: burnoutRiskScore,
        level,
        mood: moodOnly,
        calendar: {
            workload,
            overload
        },
        tasks: {
            totalOpen: openTasks.length,
            highPriorityOpen: highPriorityOpen.length
        },
        focus: focusStats || null,
        breakGaps
    };
};

module.exports = { analyzeBurnout, analyzeCompositeBurnout };
