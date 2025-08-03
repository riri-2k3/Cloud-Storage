const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const userRoutes = require('./routes/user');
const fileRoutes = require('./routes/files');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'MONGODB_URI', 
    'JWT_SECRET',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET'
];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`Error: Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Configure body parsers with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    server.close(async () => {
        console.log('Server closed');
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    shutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});