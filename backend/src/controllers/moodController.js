const Mood = require('../models/Mood');

const logMood = async (req, res) => {
    const { score, note, meetingDensity } = req.body;
    let stressLevel = 'Low';
    if (score > 40) stressLevel = 'Medium';
    if (score > 70) stressLevel = 'High';

    const mood = await Mood.create({
        user: req.user._id,
        score,
        stressLevel,
        note,
        context: { meetingDensity }
    });

    res.status(201).json(mood);
};

const getMoodHistory = async (req, res) => {
    const moods = await Mood.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(moods);
};

module.exports = { logMood, getMoodHistory };
