const Holiday = require('../models/Holiday');

// @desc    Create a new holiday
// @route   POST /api/holidays
// @access  Private/Admin
const createHoliday = async (req, res) => {
    try {
        const { name, date } = req.body;

        if (!name || !date) {
            return res.status(400).json({ message: 'Please provide both name and date' });
        }

        const holidayExists = await Holiday.findOne({ date });
        if (holidayExists) {
            return res.status(400).json({ message: 'A holiday already exists for this date' });
        }

        const holiday = new Holiday({ name, date });
        await holiday.save();

        res.status(201).json({ message: 'Holiday created successfully', holiday });
    } catch (error) {
        console.error('Error creating holiday:', error);
        res.status(500).json({ message: 'Server error creating holiday' });
    }
};

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Public or Private
const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.status(200).json(holidays);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ message: 'Server error fetching holidays' });
    }
};

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private/Admin
const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);
        
        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        
        await holiday.deleteOne();
        res.status(200).json({ message: 'Holiday removed' });
    } catch (error) {
        console.error('Error deleting holiday:', error);
        res.status(500).json({ message: 'Server error deleting holiday' });
    }
}

module.exports = {
    createHoliday,
    getHolidays,
    deleteHoliday
};
