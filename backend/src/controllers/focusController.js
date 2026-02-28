// Simple in-memory focus session tracking.

const userSessions = new Map();

const getUserSessions = (userId) => {
    const key = userId.toString();
    if (!userSessions.has(key)) {
        userSessions.set(key, []);
    }
    return userSessions.get(key);
};

const startFocusSession = async (req, res) => {
    try {
        const { goal, durationMinutes } = req.body || {};
        const sessions = getUserSessions(req.user._id);

        const now = new Date();
        const session = {
            id: `${req.user._id}-${now.getTime()}-${sessions.length + 1}`,
            goal: goal || '',
            plannedDurationMinutes: durationMinutes || null,
            startedAt: now,
            endedAt: null,
            completed: false
        };

        sessions.push(session);
        return res.status(201).json(session);
    } catch (error) {
        console.error('Error in startFocusSession:', error);
        return res.status(500).json({ message: 'Server error while starting focus session' });
    }
};

const endFocusSession = async (req, res) => {
    try {
        const { sessionId } = req.body || {};
        const sessions = getUserSessions(req.user._id);

        const session = sessions.find((s) => s.id === sessionId && !s.endedAt);
        if (!session) {
            return res.status(404).json({ message: 'Active session not found' });
        }

        const now = new Date();
        session.endedAt = now;
        session.completed = true;

        const durationMinutes = (session.endedAt - session.startedAt) / (1000 * 60);
        session.actualDurationMinutes = +durationMinutes.toFixed(1);

        return res.json(session);
    } catch (error) {
        console.error('Error in endFocusSession:', error);
        return res.status(500).json({ message: 'Server error while ending focus session' });
    }
};

const logSession = async (req, res) => {
    try {
        const payload = req.body || {};
        const sessions = getUserSessions(req.user._id);

        const session = {
            id: `${req.user._id}-${Date.now()}-${sessions.length + 1}`,
            ...payload,
            completed: true,
            // also map properties just in case
            startedAt: payload.startedAt || new Date(),
            endedAt: payload.completedAt ? new Date(payload.completedAt) : new Date(),
            actualDurationMinutes: typeof payload.duration === 'number' ? +(payload.duration / 60).toFixed(1) : 0
        };

        sessions.push(session);
        return res.status(201).json(session);
    } catch (error) {
        console.error('Error in logSession:', error);
        return res.status(500).json({ message: 'Server error while logging focus session' });
    }
};

const getSessions = async (req, res) => {
    try {
        const sessions = getUserSessions(req.user._id);
        const completed = sessions.filter((s) => s.completed || s.duration !== undefined);
        return res.json(completed);
    } catch (error) {
        console.error('Error in getSessions:', error);
        return res.status(500).json({ message: 'Server error while fetching focus sessions' });
    }
};

const getFocusStats = async (req, res) => {
    try {
        const sessions = getUserSessions(req.user._id);
        const completed = sessions.filter((s) => s.completed && s.actualDurationMinutes);

        const totalMinutes = completed.reduce(
            (acc, s) => acc + (s.actualDurationMinutes || 0),
            0
        );

        let bestStreak = 0;
        let currentStreak = 0;

        const sorted = [...completed].sort(
            (a, b) => new Date(a.startedAt) - new Date(b.startedAt)
        );

        let prevDay = null;
        sorted.forEach((session) => {
            const day = new Date(session.startedAt);
            day.setHours(0, 0, 0, 0);
            if (!prevDay) {
                currentStreak = 1;
            } else {
                const diffDays = (day - prevDay) / (1000 * 60 * 60 * 24);
                if (diffDays === 0) {
                    // same day, keep streak but do not increment
                } else if (diffDays === 1) {
                    currentStreak += 1;
                } else if (diffDays > 1) {
                    currentStreak = 1;
                }
            }
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
            }
            prevDay = day;
        });

        return res.json({
            totalSessions: sessions.length,
            completedSessions: completed.length,
            totalFocusMinutes: +totalMinutes.toFixed(1),
            currentStreakDays: currentStreak,
            bestStreakDays: bestStreak
        });
    } catch (error) {
        console.error('Error in getFocusStats:', error);
        return res.status(500).json({ message: 'Server error while fetching focus stats' });
    }
};

module.exports = {
    startFocusSession,
    endFocusSession,
    getFocusStats,
    getSessions,
    logSession
};

