const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, getAllUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', protect, getProfile);
router.put('/update', protect, updateProfile);

router.get('/all-users', protect, admin, getAllUsers);

module.exports = router;
