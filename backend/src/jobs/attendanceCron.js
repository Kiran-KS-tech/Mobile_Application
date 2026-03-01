const cron = require('node-cron');
const User = require('../models/User');
const Timer = require('../models/Timer');
const Holiday = require('../models/Holiday');
const Leave = require('../models/Leave');

// Helper to get date string YYYY-MM-DD
const getPastDateString = (date) => {
    return date.toISOString().split('T')[0];
};

const runAttendanceCheck = async () => {
    try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday

        // Check if weekend
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            console.log('Weekend, skipping attendance check.');
            return;
        }

        const dateString = getPastDateString(today);
        
        // Check if it's a holiday
        const todayMidnight = new Date(dateString);
        const nextDay = new Date(todayMidnight);
        nextDay.setDate(nextDay.getDate() + 1);

        const holiday = await Holiday.findOne({
            date: {
                $gte: todayMidnight,
                $lt: nextDay
            }
        });

        if (holiday) {
            console.log('Today is a holiday:', holiday.name, '- skipping attendance check.');
            return;
        }

        // Fetch all non-admin users (employee/manager)
        const users = await User.find({ role: { $ne: 'admin' } });

        for (const user of users) {
             const timer = await Timer.findOne({ userId: user._id, dateString });
             
             if (!timer) {
                 // No timer found, deduct leave
                 if (user.casualLeaves > 0) {
                     user.casualLeaves -= 1;
                 } else if (user.medicalLeaves > 0) {
                     user.medicalLeaves -= 1;
                 } else {
                     // Create unpaid leave
                     const unpaidLeave = new Leave({
                         userId: user._id,
                         leaveType: 'unpaid',
                         reason: 'Automated Missing Day Deduction',
                         status: 'approved',
                         startDate: todayMidnight,
                         endDate: todayMidnight
                     });
                     await unpaidLeave.save();
                 }
                 await user.save();
                 console.log(`Deducted leave for user ${user.email}`);
             }
        }
        console.log('Daily attendance check completed.');
    } catch (error) {
        console.error('Error running daily attendance check:', error);
    }
};

/**
 * Auto-checkout any active sessions at midnight and reset for the new day.
 */
const runMidnightReset = async () => {
    try {
        console.log('Running midnight reset for attendance...');
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDateString = yesterday.toISOString().split('T')[0];

        // Find all timers from yesterday that are still active (no checkOutTime)
        const activeTimers = await Timer.find({
            dateString: yesterdayDateString,
            checkOutTime: { $exists: false }
        });

        console.log(`Found ${activeTimers.length} active sessions to auto-checkout from yesterday.`);

        for (const timer of activeTimers) {
            // Set checkout time to the end of the day (23:59:59)
            const endOfDay = new Date(yesterday);
            endOfDay.setHours(23, 59, 59, 999);
            
            const sessionDurationInMillis = endOfDay.getTime() - timer.checkInTime.getTime();
            const sessionDurationInSeconds = Math.max(0, Math.floor(sessionDurationInMillis / 1000));

            timer.checkOutTime = endOfDay;
            timer.duration = (timer.duration || 0) + sessionDurationInSeconds;
            
            await timer.save();
            console.log(`Auto-checked out timer for user ${timer.userId} for date ${yesterdayDateString}`);
        }
        
        console.log('Midnight attendance reset completed.');
    } catch (error) {
        console.error('Error running midnight attendance reset:', error);
    }
};

const initCronJobs = () => {
    // Run at 23:59 to check for missing attendance
    cron.schedule('59 23 * * *', () => {
        console.log('Running daily attendance cron job...');
        runAttendanceCheck();
    });

    // Run at 00:00 to auto-checkout active sessions from the previous day
    cron.schedule('0 0 * * *', () => {
        console.log('Running midnight reset cron job...');
        runMidnightReset();
    });

    console.log('Attendance cron jobs registered.');
};

module.exports = { initCronJobs, runAttendanceCheck, runMidnightReset };
