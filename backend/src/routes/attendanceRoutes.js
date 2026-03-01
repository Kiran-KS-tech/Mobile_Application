const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMyRecords, getAllRecords, getUserRecords } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/check-in', protect, checkIn);
router.put('/check-out', protect, checkOut);
router.get('/my-records', protect, getMyRecords);

// Admin routes
router.get('/all-records', protect, admin, getAllRecords);
router.get('/user/:userId', protect, admin, getUserRecords);

module.exports = router;
