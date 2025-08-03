const User = require('./models/User'); // Import User model
// Manual signup route for testing
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).send('User registered successfully!');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to fetch all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan'); // For logging requests
const userRoutes = require('./routes/user'); // Import user routes

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`Error: Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

// Initialize Express app
const app = express(); // Initialize 'app' here, before using it

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Log requests to the console

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Routes
app.use('/api/users', userRoutes); // Use user routes

// Health check route
app.get('/', (req, res) => {
  res.send('Backend is running successfully ✅');
});

// MongoDB connection test route
app.get('/test-db', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ status: 'Connected to DB ✅', collections });
  } catch (err) {
    res.status(500).json({ status: 'DB Error', error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export app for testing

// Graceful shutdown
const shutdown = async () => {
    server.close(async () => {
        console.log('Server shutting down...');
        await mongoose.connection.close(); // Remove the callback
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
