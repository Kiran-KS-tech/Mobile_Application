const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Apply for leave
// @route   POST /api/leave/apply
// @access  Private
const applyLeave = async (req, res) => {
    try {
        const { leaveType, reason, startDate, endDate } = req.body;

        if (!leaveType || !reason || !startDate || !endDate) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Calculate duration in days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        if (duration <= 0) {
            return res.status(400).json({ message: 'End date must be after or same as start date' });
        }

        // Fetch user to check balance
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (leaveType === 'medical' && user.medicalLeaves < duration) {
            return res.status(400).json({ message: `Not enough medical leaves. Requested: ${duration}, Available: ${user.medicalLeaves}` });
        }
        if (leaveType === 'casual' && user.casualLeaves < duration) {
            return res.status(400).json({ message: `Not enough casual leaves. Requested: ${duration}, Available: ${user.casualLeaves}` });
        }

        const leave = new Leave({
            userId: req.user._id,
            leaveType,
            reason,
            startDate,
            endDate,
            status: 'pending' // Default status
        });

        await leave.save();
        res.status(201).json({ message: 'Leave application submitted successfully', leave });
    } catch (error) {
        console.error('Error applying for leave:', error);
        res.status(500).json({ message: 'Server error applying for leave' });
    }
};

// @desc    Get all pending leaves (Admin only)
// @route   GET /api/leave/pending
// @access  Private/Admin
const getPendingLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ status: 'pending' }).populate('userId', 'name email').sort({ appliedAt: -1 });
        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching leaves' });
    }
};

// @desc    Approve or reject a leave request (Admin only)
// @route   PUT /api/leave/:id/status
// @access  Private/Admin
const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const leaveId = req.params.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await Leave.findById(leaveId);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Check if it's already processed to prevent double deduction
        if (leave.status !== 'pending') {
            return res.status(400).json({ message: `Leave is already ${leave.status}` });
        }

        leave.status = status;
        await leave.save();

        // If approved, deduct leave from user
        if (status === 'approved') {
            const user = await User.findById(leave.userId);
            if (user) {
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

                if (leave.leaveType === 'medical') {
                    user.medicalLeaves -= duration;
                } else if (leave.leaveType === 'casual') {
                    user.casualLeaves -= duration;
                }
                await user.save();
            }
        }

        res.status(200).json({ message: `Leave ${status} successfully`, leave });
    } catch (error) {
         console.error('Error updating leave status:', error);
         res.status(500).json({ message: 'Server error updating leave status' });
    }
};

// @desc    Get my leaves
// @route   GET /api/leave/my-leaves
// @access  Private
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ userId: req.user._id }).sort({ appliedAt: -1 });
        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching your leaves' });
    }
};

module.exports = {
    applyLeave,
    getPendingLeaves,
    updateLeaveStatus,
    getMyLeaves
};
