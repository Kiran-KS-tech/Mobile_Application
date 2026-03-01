const mongoose = require('mongoose');

const holidaySchema = mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true, unique: true }
}, { timestamps: true });

const Holiday = mongoose.model('Holiday', holidaySchema);
module.exports = Holiday;
