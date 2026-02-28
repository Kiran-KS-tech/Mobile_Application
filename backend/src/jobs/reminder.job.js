const cron = require('node-cron');

// This job file wires time-based reminders. In a production setup you would
// deliver these via push notifications, email, or in-app notifications. For
// now, it exposes hooks that can be connected to your notification layer.

const registerReminderJobs = ({ onMoodCheck, onBreakReminder, onFocusReminder } = {}) => {
    // Mood check – e.g. at 10:00 every weekday
    cron.schedule('0 10 * * 1-5', () => {
        if (onMoodCheck) {
            onMoodCheck();
        } else {
            console.log('[ReminderJob] Mood check reminder triggered');
        }
    });

    // Break reminder – every 60 minutes during work hours
    cron.schedule('0 * * * 1-5', () => {
        if (onBreakReminder) {
            onBreakReminder();
        } else {
            console.log('[ReminderJob] Break reminder triggered');
        }
    });

    // Focus reminder – e.g. at 9:00 and 14:00
    cron.schedule('0 9,14 * * 1-5', () => {
        if (onFocusReminder) {
            onFocusReminder();
        } else {
            console.log('[ReminderJob] Focus reminder triggered');
        }
    });
};

module.exports = {
    registerReminderJobs
};

