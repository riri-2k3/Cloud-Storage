const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Authentication Failed',
                message: 'Access token is required' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Authentication Failed',
                message: 'Access token is required' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request object
        req.user = {
            id: decoded.id,
            email: decoded.email
        };
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Access token has expired'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid access token'
            });
        }
        
        return res.status(500).json({
            error: 'Server Error',
            message: 'Authentication service unavailable'
        });
    }
};

// Optional: Middleware to check if user is authenticated but don't fail if not
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader?.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email
        };
        
        next();
    } catch (error) {
        // If token is invalid, just set user to null and continue
        req.user = null;
        next();
    }
};

module.exports = { 
    authenticateToken,
    optionalAuth 
};