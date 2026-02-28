const {
    createEvent,
    listEvents,
    updateEvent,
    deleteEvent,
    calculateWorkload,
    detectMeetingOverload,
    suggestFreeSlots
} = require('../services/calendarService');

const createCalendarEvent = async (req, res) => {
    try {
        let { title, description, start, end, startTime, endTime, type, metadata } = req.body;

        start = start || startTime;
        end = end || endTime;

        if (!start || !end) {
            return res.status(400).json({ message: 'Start and end times are required' });
        }

        const { event, conflicts } = await createEvent(req.user._id, {
            title,
            description,
            start,
            end,
            type,
            metadata
        });

        return res.status(201).json({ event, conflicts });
    } catch (error) {
        console.error('Error in createCalendarEvent:', error);
        return res.status(500).json({ message: 'Server error while creating calendar event' });
    }
};

const getCalendarEvents = async (req, res) => {
    try {
        const { day } = req.query;
        const events = await listEvents(req.user._id, { day });

        const workload = calculateWorkload(events, day);
        const overload = detectMeetingOverload(events, day);
        const freeSlots = suggestFreeSlots(events, { day });

        return res.json({
            events,
            workload,
            overload,
            freeSlots
        });
    } catch (error) {
        console.error('Error in getCalendarEvents:', error);
        return res.status(500).json({ message: 'Server error while fetching calendar events' });
    }
};

const updateCalendarEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await updateEvent(req.user._id, id, req.body || {});

        if (!updated) {
            return res.status(404).json({ message: 'Event not found' });
        }

        return res.json(updated);
    } catch (error) {
        console.error('Error in updateCalendarEvent:', error);
        return res.status(500).json({ message: 'Server error while updating calendar event' });
    }
};

const deleteCalendarEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const removed = await deleteEvent(req.user._id, id);

        if (!removed) {
            return res.status(404).json({ message: 'Event not found' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Error in deleteCalendarEvent:', error);
        return res.status(500).json({ message: 'Server error while deleting calendar event' });
    }
};

module.exports = {
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent
};

