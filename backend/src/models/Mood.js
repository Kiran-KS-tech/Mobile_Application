const mongoose = require('mongoose');

const moodSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    score: { type: Number, required: true },
    stressLevel: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    note: { type: String },
    energyLevel: { type: Number },
    context: {
        meetingDensity: Number,
        emailVolume: Number
    }
}, { timestamps: true });

const Mood = mongoose.model('Mood', moodSchema);
module.exports = Mood;
