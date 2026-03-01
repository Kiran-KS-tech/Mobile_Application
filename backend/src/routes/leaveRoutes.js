const express = require('express');
const router = express.Router();
const { applyLeave, getPendingLeaves, updateLeaveStatus, getMyLeaves } = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/authMiddleware');

// User routes
router.post('/apply', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);

// Admin routes
router.get('/pending', protect, admin, getPendingLeaves);
router.put('/:id/status', protect, admin, updateLeaveStatus);

module.exports = router;
