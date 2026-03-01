const express = require('express');
const router = express.Router();
const { createHoliday, getHolidays, deleteHoliday } = require('../controllers/holidayController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createHoliday)
    .get(protect, getHolidays);

router.route('/:id')
    .delete(protect, admin, deleteHoliday);

module.exports = router;
