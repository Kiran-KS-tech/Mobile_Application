const express = require('express');
const router = express.Router();
const {
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent
} = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/event', createCalendarEvent);
router.get('/events', getCalendarEvents);
router.put('/event/:id', updateCalendarEvent);
router.delete('/event/:id', deleteCalendarEvent);

module.exports = router;

