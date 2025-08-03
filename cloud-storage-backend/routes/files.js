const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const File = require('../models/File');
const { authenticateToken } = require('../middleware/auth');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Configure Multer with file size limit
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Optional: Add file type restrictions here
        cb(null, true);
    }
});

// Upload file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: 'No file provided' 
            });
        }

        // Generate unique file key
        const fileKey = `${req.user.id}/${Date.now()}-${req.file.originalname}`;
        
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ServerSideEncryption: 'AES256' // Optional: Add encryption
        };

        const s3Upload = await s3.upload(params).promise();

        const file = new File({
            name: fileKey,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            key: s3Upload.Key,
            owner: req.user.id
        });

        await file.save();
        
        res.status(201).json({
            message: 'File uploaded successfully',
            file: {
                id: file._id,
                name: file.originalName,
                size: file.size,
                mimeType: file.mimeType,
                createdAt: file.createdAt
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File Too Large',
                message: 'File size should be less than 10MB' 
            });
        }
        
        res.status(500).json({ 
            error: 'Server Error',
            message: 'Error uploading file' 
        });
    }
});

// Get all files for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const files = await File.find({ owner: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-key -owner'); // Don't send sensitive data

        const totalFiles = await File.countDocuments({ owner: req.user.id });

        res.json({
            files: files.map(file => ({
                id: file._id,
                name: file.originalName,
                size: file.size,
                mimeType: file.mimeType,
                createdAt: file.createdAt
            })),
            pagination: {
                page,
                limit,
                total: totalFiles,
                pages: Math.ceil(totalFiles / limit)
            }
        });
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ 
            error: 'Server Error',
            message: 'Error retrieving files' 
        });
    }
});

// Download file
router.get('/:id/download', authenticateToken, async (req, res) => {
    try {
        const file = await File.findOne({ 
            _id: req.params.id, 
            owner: req.user.id 
        });
        
        if (!file) {
            return res.status(404).json({ 
                error: 'Not Found',
                message: 'File not found' 
            });
        }

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: file.key
        };

        try {
            const s3Object = await s3.getObject(params).promise();
            
            res.set({
                'Content-Type': file.mimeType,
                'Content-Disposition': `attachment; filename="${file.originalName}"`,
                'Content-Length': s3Object.ContentLength
            });
            
            res.send(s3Object.Body);
        } catch (s3Error) {
            console.error('S3 download error:', s3Error);
            
            if (s3Error.code === 'NoSuchKey') {
                return res.status(404).json({ 
                    error: 'File Not Found',
                    message: 'File no longer exists in storage' 
                });
            }
            
            throw s3Error;
        }
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            error: 'Server Error',
            message: 'Error downloading file' 
        });
    }
});

// Delete file
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const file = await File.findOne({ 
            _id: req.params.id, 
            owner: req.user.id 
        });
        
        if (!file) {
            return res.status(404).json({ 
                error: 'Not Found',
                message: 'File not found' 
            });
        }

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: file.key
        };

        try {
            await s3.deleteObject(params).promise();
        } catch (s3Error) {
            console.error('S3 delete error:', s3Error);
            // Continue with database deletion even if S3 delete fails
        }

        await File.deleteOne({ _id: file._id });
        
        res.json({ 
            message: 'File deleted successfully' 
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ 
            error: 'Server Error',
            message: 'Error deleting file' 
        });
    }
});

// Get file info (metadata only)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const file = await File.findOne({ 
            _id: req.params.id, 
            owner: req.user.id 
        }).select('-key -owner');
        
        if (!file) {
            return res.status(404).json({ 
                error: 'Not Found',
                message: 'File not found' 
            });
        }

        res.json({
            file: {
                id: file._id,
                name: file.originalName,
                size: file.size,
                mimeType: file.mimeType,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt
            }
        });
    } catch (error) {
        console.error('Get file info error:', error);
        res.status(500).json({ 
            error: 'Server Error',
            message: 'Error retrieving file information' 
        });
    }
});

module.exports = router;