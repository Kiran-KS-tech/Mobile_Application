const { analyzeCompositeBurnout } = require('../services/burnoutService');
const { getFocusStats } = require('./focusController');
const { listEvents } = require('../services/calendarService');

const getBurnoutStatus = async (req, res) => {
    try {
        const mockReq = { ...req };
        const focusStatsResult = await new Promise((resolve) => {
            const mockRes = {
                json: (data) => resolve(data),
                status: () => ({
                    json: (data) => resolve(data)
                })
            };
            getFocusStats(mockReq, mockRes);
        });

        const burnout = await analyzeCompositeBurnout(req.user._id, {
            focusStats: focusStatsResult
        });

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Fetch all events for next 7 days for upcoming events
        const allEvents = await listEvents(req.user._id);
        const upcomingEvents = allEvents
            .filter(e => new Date(e.start) >= today)
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5)
            .map(e => ({
                id: e.id,
                title: e.title,
                type: e.type,
                startTime: e.start,
                endTime: e.end,
                date: e.start.split('T')[0]
            }));

        const summary = {
            burnoutRisk: burnout.burnoutRisk,
            workloadScore: Math.min(100, Math.round((burnout.calendar.workload.hours / 8) * 100)),
            focusHours: +(burnout.calendar.workload.hours).toFixed(1), // Using workload hours as focus placeholder for now if focus is null
            moodTrend: 'stable',
            streakDays: burnout.focus ? burnout.focus.streakDays || 0 : 3, // Mock streak if null
            upcomingEvents: upcomingEvents,
            weeklyHighlight: 'Your focus hits a peak on Tuesday mornings.'
        };

        return res.json(summary);
    } catch (error) {
        console.error('Error in getBurnoutStatus:', error);
        return res.status(500).json({ message: 'Server error while calculating burnout status' });
    }
};

module.exports = {
    getBurnoutStatus
};

