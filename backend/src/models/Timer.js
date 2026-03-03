const mongoose = require('mongoose');

const timerSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date },
    duration: { type: Number, default: 0 }, // in seconds
    dateString: { type: String, required: true }, // format: YYYY-MM-DD for easy querying
    lateBySeconds: { type: Number, default: 0 } // seconds late past scheduled start (9:00 AM); 0 if on time
}, { timestamps: true });

const Timer = mongoose.model('Timer', timerSchema);
module.exports = Timer;
