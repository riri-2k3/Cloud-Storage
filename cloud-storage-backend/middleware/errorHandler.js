const errorHandler = (err, req, res, next) => {
    console.error('Error Stack:', err.stack);
    console.error('Error Details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        status: err.status
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            error: 'Duplicate Error',
            message: `${field} already exists`,
            field: field
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID',
            message: 'Invalid resource ID format'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Authentication Failed',
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Authentication Failed',
            message: 'Token expired'
        });
    }

    // Multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File Too Large',
                message: 'File size exceeds the maximum limit of 10MB'
            });
        }
        
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Invalid File Upload',
                message: 'Unexpected file field'
            });
        }
        
        return res.status(400).json({
            error: 'File Upload Error',
            message: err.message
        });
    }

    // AWS S3 errors
    if (err.code === 'NoSuchBucket') {
        return res.status(500).json({
            error: 'Storage Error',
            message: 'Storage service is temporarily unavailable'
        });
    }

    if (err.code === 'AccessDenied') {
        return res.status(500).json({
            error: 'Storage Error',
            message: 'Storage access denied'
        });
    }

    // MongoDB connection errors
    if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
        return res.status(503).json({
            error: 'Database Error',
            message: 'Database service is temporarily unavailable'
        });
    }

    // Rate limiting errors (if you add rate limiting)
    if (err.status === 429) {
        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.'
        });
    }

    // Default to 500 server error
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';

    // Don't leak error details in production
    const errorResponse = {
        error: 'Server Error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong' 
            : message
    };

    // Add error ID for tracking in production
    if (process.env.NODE_ENV === 'production') {
        const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        errorResponse.errorId = errorId;
        console.error(`Error ID: ${errorId}`, err);
    }

    return res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;