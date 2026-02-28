const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sanitizeUser = (user) => {
    if (!user) return null;
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        if (!user) {
            return res.status(400).json({ message: 'Invalid user data' });
        }

        const sanitized = sanitizeUser(user);

        return res.status(201).json({
            user: sanitized,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        return res.status(500).json({ message: 'Server error while registering user' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const sanitized = sanitizeUser(user);

        return res.json({
            user: sanitized,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Error in loginUser:', error);
        return res.status(500).json({ message: 'Server error while logging in' });
    }
};

const getProfile = async (req, res) => {
    try {
        // req.user is populated by auth middleware and already excludes password
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const sanitized = sanitizeUser(user);
        return res.json({ user: sanitized });
    } catch (error) {
        console.error('Error in getProfile:', error);
        return res.status(500).json({ message: 'Server error while fetching profile' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        const updatedUser = await user.save();
        const sanitized = sanitizeUser(updatedUser);

        return res.json({
            user: sanitized,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        return res.status(500).json({ message: 'Server error while updating profile' });
    }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
