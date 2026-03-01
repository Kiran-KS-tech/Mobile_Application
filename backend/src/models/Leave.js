const mongoose = require('mongoose');

const leaveSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: { type: String, enum: ['medical', 'casual', 'unpaid'], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
