const Mood = require('../models/Mood');

const logMood = async (req, res) => {
    try {
        const { score, note, meetingDensity, energyLevel } = req.body;

        if (typeof score !== 'number') {
            return res.status(400).json({ message: 'Score is required and must be a number' });
        }

        let stressLevel = 'Low';
        if (score > 40) stressLevel = 'Medium';
        if (score > 70) stressLevel = 'High';

        const mood = await Mood.create({
            user: req.user._id,
            score,
            stressLevel,
            energyLevel,
            note,
            context: { meetingDensity }
        });

        return res.status(201).json(mood);
    } catch (error) {
        console.error('Error in logMood:', error);
        return res.status(500).json({ message: 'Server error while logging mood' });
    }
};

const getMoodHistory = async (req, res) => {
    try {
        const moods = await Mood.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.json(moods);
    } catch (error) {
        console.error('Error in getMoodHistory:', error);
        return res.status(500).json({ message: 'Server error while fetching mood history' });
    }
};

const getMoodAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const pipeline = [
            {
                $match: {
                    user: userId,
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    averageScore: { $avg: '$score' },
                    entries: { $sum: 1 },
                    highStressCount: {
                        $sum: {
                            $cond: [{ $eq: ['$stressLevel', 'High'] }, 1, 0]
                        }
                    },
                    mediumStressCount: {
                        $sum: {
                            $cond: [{ $eq: ['$stressLevel', 'Medium'] }, 1, 0]
                        }
                    },
                    lowStressCount: {
                        $sum: {
                            $cond: [{ $eq: ['$stressLevel', 'Low'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1,
                    '_id.day': 1
                }
            }
        ];

        const aggregated = await Mood.aggregate(pipeline);

        if (!aggregated || aggregated.length === 0) {
            return res.json({
                weeklyTrend: [],
                stressAverage: null,
                burnoutIndicator: {
                    level: 'Unknown',
                    score: null,
                    message: 'Not enough mood data in the last week.'
                }
            });
        }

        const weeklyTrend = aggregated.map((item) => {
            const date = new Date(item._id.year, item._id.month - 1, item._id.day);
            const totalStressEntries =
                item.highStressCount + item.mediumStressCount + item.lowStressCount || 1;

            return {
                date,
                averageScore: item.averageScore,
                entries: item.entries,
                stressDistribution: {
                    high: item.highStressCount,
                    medium: item.mediumStressCount,
                    low: item.lowStressCount
                },
                highStressRatio: item.highStressCount / totalStressEntries
            };
        });

        const totalEntries = aggregated.reduce((acc, item) => acc + item.entries, 0);
        const weightedScoreSum = aggregated.reduce(
            (acc, item) => acc + item.averageScore * item.entries,
            0
        );
        const stressAverage = weightedScoreSum / (totalEntries || 1);

        const totalHighStress = aggregated.reduce(
            (acc, item) => acc + item.highStressCount,
            0
        );
        const totalStressSamples = aggregated.reduce(
            (acc, item) =>
                acc + item.highStressCount + item.mediumStressCount + item.lowStressCount,
            0
        );
        const highStressRate = totalStressSamples
            ? totalHighStress / totalStressSamples
            : 0;

        // Simple burnout heuristic based purely on mood data
        let level = 'Low';
        let message = 'Your mood trend looks stable. Keep up your current routines.';

        if (stressAverage > 50 || highStressRate > 0.25) {
            level = 'Medium';
            message =
                'You are showing some elevated stress levels. Consider scheduling regular breaks and recovery time.';
        }

        if (stressAverage > 70 || highStressRate > 0.4) {
            level = 'High';
            message =
                'Sustained high stress detected. It may be time to reduce workload and seek additional support.';
        }

        // Map to a 0–100 burnout score for analytics dashboards
        const normalizedScore = Math.min(
            100,
            Math.round((stressAverage / 100) * 70 + highStressRate * 30 * 100)
        );

        return res.json({
            weeklyTrend,
            stressAverage,
            burnoutIndicator: {
                level,
                score: normalizedScore,
                highStressRate,
                message
            }
        });
    } catch (error) {
        console.error('Error in getMoodAnalytics:', error);
        return res.status(500).json({ message: 'Server error while calculating mood analytics' });
    }
};

module.exports = { logMood, getMoodHistory, getMoodAnalytics };
