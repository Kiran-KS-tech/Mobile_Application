const Timer = require('../models/Timer');
const moment = require('moment'); // We can use moment or native JS for dates. Let's stick to native JS to avoid extra dependencies if possible.

// Helper to get current date string in YYYY-MM-DD
const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// @desc    Check-in to start time tracking
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res) => {
    try {
        const dateString = getTodayDateString();

        // Check if there's already an active timer for this user
        let activeTimer = await Timer.findOne({
            userId: req.user._id,
            checkOutTime: { $exists: false }
        });

        if (activeTimer) {
            // If it's a new day, auto-checkout the previous day's timer and start a new one
            if (activeTimer.dateString !== dateString) {
                const yesterdayStr = activeTimer.dateString;
                const yesterdayEnd = new Date(activeTimer.checkInTime);
                yesterdayEnd.setHours(23, 59, 59, 999);
                
                const sessionDurationInMillis = yesterdayEnd.getTime() - activeTimer.checkInTime.getTime();
                const sessionDurationInSeconds = Math.max(0, Math.floor(sessionDurationInMillis / 1000));

                activeTimer.checkOutTime = yesterdayEnd;
                activeTimer.duration = (activeTimer.duration || 0) + sessionDurationInSeconds;
                await activeTimer.save();
                
                // Proceed to create new timer for today
            } else {
                return res.status(400).json({ message: 'You have already checked in and are currently active.' });
            }
        }

        // Create a new timer session for every check-in
        const timer = new Timer({
            userId: req.user._id,
            checkInTime: new Date(),
            dateString
        });

        await timer.save();
        res.status(201).json({ message: 'Checked in successfully', timer });
    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({ message: 'Server error during check-in' });
    }
};

const checkOut = async (req, res) => {
    try {
        const dateString = getTodayDateString();

        // Find the active timer for today
        const timer = await Timer.findOne({
            userId: req.user._id,
            dateString,
            checkOutTime: { $exists: false }
        });

        if (!timer) {
            return res.status(400).json({ message: 'No active check-in found for today.' });
        }

        const now = new Date();
        const sessionDurationInMillis = now.getTime() - timer.checkInTime.getTime();
        const sessionDurationInSeconds = Math.floor(sessionDurationInMillis / 1000);

        timer.checkOutTime = now;
        timer.duration = (timer.duration || 0) + sessionDurationInSeconds;

        await timer.save();
        res.status(200).json({ message: 'Checked out successfully', timer });
    } catch (error) {
         console.error('Error checking out:', error);
         res.status(500).json({ message: 'Server error during check-out' });
    }
};

// @desc    Get logged in user's attendance records
// @route   GET /api/attendance/my-records
// @access  Private
const getMyRecords = async (req, res) => {
    try {
        const records = await Timer.find({ userId: req.user._id }).sort({ checkInTime: -1 });
        res.status(200).json(records);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ message: 'Server error fetching records' });
    }
};

// @desc    Get all users' attendance records summarized by day
// @route   GET /api/attendance/all-records
// @access  Private/Admin
const getAllRecords = async (req, res) => {
    try {
        const match = {};
        if (req.query.date) {
            match.dateString = req.query.date;
        }

        const records = await Timer.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { userId: "$userId", dateString: "$dateString" },
                    totalDuration: { $sum: "$duration" },
                    firstCheckIn: { $min: "$checkInTime" },
                    lastCheckOut: { $max: "$checkOutTime" },
                    sessions: { $push: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id.userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    userId: {
                        _id: '$user._id',
                        name: '$user.name',
                        email: '$user.email'
                    },
                    dateString: '$_id.dateString',
                    totalDuration: 1,
                    firstCheckIn: 1,
                    lastCheckOut: 1,
                    isOngoing: {
                        $cond: [
                            { $gt: [{ $size: { $filter: { input: "$sessions", as: "s", cond: { $not: ["$$s.checkOutTime"] } } } }, 0] },
                            true,
                            false
                        ]
                    }
                }
            },
            { $sort: { dateString: -1, firstCheckIn: -1 } }
        ]);
            
        res.status(200).json(records);
    } catch (error) {
        console.error('Error fetching all records:', error);
        res.status(500).json({ message: 'Server error fetching all records' });
    }
};

// @desc    Get attendance records for a specific user
// @route   GET /api/attendance/user/:userId
// @access  Private/Admin
const getUserRecords = async (req, res) => {
    try {
        const records = await Timer.find({ userId: req.params.userId })
            .sort({ checkInTime: -1 });
        res.status(200).json(records);
    } catch (error) {
        console.error('Error fetching user records:', error);
        res.status(500).json({ message: 'Server error fetching user records' });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getMyRecords,
    getAllRecords,
    getUserRecords
};
