
import express from 'express';
import jwt from 'jsonwebtoken';

import User  from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        const userExists = await User.findOne({ $or: [{ username }, { email }, { phone }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            phone,
        });

        if (user) {
            const token = jwt.sign(
                { user: { id: user._id } },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.status(201).json({
               user,
                token,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { identifier } = req.body;

        if (!identifier) {
            return res.status(400).json({ message: 'Identifier is required' });
        }

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }, { phone: identifier }],
        });

        if (user) {
            const token = jwt.sign(
                { user: { id: user._id } },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            user.lastLogin = new Date();
            await user.save();

            res.json({
                user,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = {};
        const { username, email, phoneNumber, avatar, password } = req.body;

        // Basic manual validation directly within the route
        if (username !== undefined && !username?.trim()) {
            return res.status(400).json({ message: 'Username cannot be empty' });
        }
        if (email !== undefined && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (phoneNumber !== undefined && !/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Phone number must be 10 digits' });
        }
        if (password !== undefined && password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Only allow updating specific fields if they are present and valid
        if (username) updateData.username = username.trim();
        if (email) updateData.email = email.trim();
        if (phoneNumber) updateData.phoneNumber = phoneNumber.trim();
        if (avatar) updateData.avatar = avatar.trim();

        // Handle password update securely
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Ensure the user being updated is the logged-in user
        if (req.user.id.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User profile updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Update profile error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// @desc    Get all users only)
// @route   GET /api/users
// @access  Privat Admin
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Privat Admin
router.delete('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Update user role b
// @route   PUT /api/users/:id/role
// @access  Privat Admin
router.put('/:id/role', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = req.body.role || user.role; // Update role or keep existing

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;