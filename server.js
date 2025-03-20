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

// Connect to MongoDB
const connectionString = 'mongodb+srv://riri-2k3:Hrishika@cluster0.uvsig.mongodb.net/cloud-storage?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Routes
app.use('/api/users', userRoutes); // Use user routes

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
