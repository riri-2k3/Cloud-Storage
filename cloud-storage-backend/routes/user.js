const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: 'Email and password are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User Exists',
                message: 'User with this email already exists' 
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user
        const newUser = new User({ 
            email: email.toLowerCase(), 
            password: hashedPassword 
        });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Server Error',
            message: 'Error registering user' 
        });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: 'Email and password are required' 
            });
        }

        // Find the user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ 
                error: 'Authentication Failed',
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                error: 'Authentication Failed',
                message: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Server Error',
            message: 'Error logging in user' 
        });
    }
});

// Get user profile (protected route)
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ 
        message: 'Profile retrieved successfully',
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

// Verify token (useful for frontend to check if token is still valid)
router.get('/verify', authenticateToken, (req, res) => {
    res.json({ 
        valid: true,
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

module.exports = router;