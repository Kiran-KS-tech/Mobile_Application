// Simple in-memory calendar store per user.
// This keeps behavior internal to the service layer without new database models.

const userEvents = new Map();

const getUserEvents = (userId) => {
    const key = userId.toString();
    if (!userEvents.has(key)) {
        userEvents.set(key, []);
    }
    return userEvents.get(key);
};

const detectConflict = (events, newEvent) => {
    const newStart = new Date(newEvent.start);
    const newEnd = new Date(newEvent.end);

    return events.filter((event) => {
        const start = new Date(event.start);
        const end = new Date(event.end);

        // Overlap if start is before existing end and end is after existing start
        return newStart < end && newEnd > start;
    });
};

const calculateWorkload = (events, day) => {
    const target = day ? new Date(day) : new Date();
    const targetDayStart = new Date(target);
    targetDayStart.setHours(0, 0, 0, 0);
    const targetDayEnd = new Date(targetDayStart);
    targetDayEnd.setDate(targetDayEnd.getDate() + 1);

    let totalMinutes = 0;

    events.forEach((event) => {
        const start = new Date(event.start);
        const end = new Date(event.end);

        if (end <= targetDayStart || start >= targetDayEnd) {
            return;
        }

        const clampedStart = start < targetDayStart ? targetDayStart : start;
        const clampedEnd = end > targetDayEnd ? targetDayEnd : end;

        const minutes = (clampedEnd - clampedStart) / (1000 * 60);
        totalMinutes += Math.max(0, minutes);
    });

    return {
        totalMinutes,
        hours: +(totalMinutes / 60).toFixed(2)
    };
};

const detectMeetingOverload = (events, day) => {
    const { totalMinutes, hours } = calculateWorkload(events, day);

    let level = 'Low';
    let message = 'Your calendar load looks manageable today.';

    if (hours >= 4 && hours < 6) {
        level = 'Medium';
        message = 'You have a heavy meeting load. Consider blocking some focus time.';
    } else if (hours >= 6) {
        level = 'High';
        message =
            'You are in back-to-back meetings most of the day. This is a strong burnout risk factor.';
    }

    return {
        level,
        hours,
        totalMinutes,
        message
    };
};

const suggestFreeSlots = (events, options = {}) => {
    const {
        day = new Date(),
        workdayStartHour = 9,
        workdayEndHour = 18,
        minSlotMinutes = 30
    } = options;

    const targetDay = new Date(day);
    targetDay.setHours(0, 0, 0, 0);

    const dayStart = new Date(targetDay);
    dayStart.setHours(workdayStartHour, 0, 0, 0);

    const dayEnd = new Date(targetDay);
    dayEnd.setHours(workdayEndHour, 0, 0, 0);

    const relevantEvents = events
        .map((event) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
        }))
        .filter((event) => !(event.end <= dayStart || event.start >= dayEnd))
        .sort((a, b) => a.start - b.start);

    const freeSlots = [];
    let currentStart = dayStart;

    relevantEvents.forEach((event) => {
        if (event.start > currentStart) {
            const gapMinutes = (event.start - currentStart) / (1000 * 60);
            if (gapMinutes >= minSlotMinutes) {
                freeSlots.push({
                    start: new Date(currentStart),
                    end: new Date(event.start),
                    minutes: gapMinutes
                });
            }
        }
        if (event.end > currentStart) {
            currentStart = event.end;
        }
    });

    if (dayEnd > currentStart) {
        const gapMinutes = (dayEnd - currentStart) / (1000 * 60);
        if (gapMinutes >= minSlotMinutes) {
            freeSlots.push({
                start: new Date(currentStart),
                end: new Date(dayEnd),
                minutes: gapMinutes
            });
        }
    }

    return freeSlots;
};

const createEvent = async (userId, payload) => {
    const events = getUserEvents(userId);
    const base = {
        id: `${userId}-${Date.now()}-${events.length + 1}`,
        title: payload.title || 'Untitled',
        description: payload.description || '',
        start: payload.start,
        end: payload.end,
        type: payload.type || 'meeting',
        metadata: payload.metadata || {}
    };

    const conflicts = detectConflict(events, base);
    events.push(base);

    return { event: base, conflicts };
};

const listEvents = async (userId, { day } = {}) => {
    const events = getUserEvents(userId);
    if (!day) return events;

    const targetDay = new Date(day);
    targetDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDay);
    nextDay.setDate(nextDay.getDate() + 1);

    return events.filter((event) => {
        const start = new Date(event.start);
        return start >= targetDay && start < nextDay;
    });
};

const updateEvent = async (userId, eventId, payload) => {
    const events = getUserEvents(userId);
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) {
        return null;
    }

    const updated = {
        ...events[idx],
        ...payload
    };
    events[idx] = updated;

    return updated;
};

const deleteEvent = async (userId, eventId) => {
    const events = getUserEvents(userId);
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) {
        return false;
    }
    events.splice(idx, 1);
    return true;
};

module.exports = {
    createEvent,
    listEvents,
    updateEvent,
    deleteEvent,
    detectConflict,
    calculateWorkload,
    detectMeetingOverload,
    suggestFreeSlots
};

