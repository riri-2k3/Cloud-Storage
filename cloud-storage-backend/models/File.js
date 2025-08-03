const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'File name is required'],
        trim: true
    },
    originalName: {
        type: String,
        required: [true, 'Original file name is required'],
        trim: true
    },
    mimeType: {
        type: String,
        required: [true, 'File MIME type is required']
    },
    size: {
        type: Number,
        required: [true, 'File size is required'],
        min: [0, 'File size cannot be negative']
    },
    key: {
        type: String,
        required: [true, 'File storage key is required'],
        unique: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'File owner is required']
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    downloadCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for better query performance
fileSchema.index({ owner: 1, createdAt: -1 });
fileSchema.index({ owner: 1, isDeleted: 1 });
fileSchema.index({ key: 1 });

// Virtual for file extension
fileSchema.virtual('extension').get(function() {
    const name = this.originalName;
    return name.split('.').pop().toLowerCase();
});

// Virtual for formatted file size
fileSchema.virtual('formattedSize').get(function() {
    const bytes = this.size;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Static method to find files by owner
fileSchema.statics.findByOwner = function(ownerId, options = {}) {
    const query = { owner: ownerId, isDeleted: false };
    
    if (options.mimeType) {
        query.mimeType = new RegExp(options.mimeType, 'i');
    }
    
    return this.find(query);
};

// Static method to get user's storage usage
fileSchema.statics.getStorageUsage = function(ownerId) {
    return this.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(ownerId), isDeleted: false } },
        { $group: { _id: null, totalSize: { $sum: '$size' }, fileCount: { $sum: 1 } } }
    ]);
};

// Instance method to soft delete
fileSchema.methods.softDelete = function() {
    this.isDeleted = true;
    return this.save();
};

// Pre-save middleware to validate file size (10MB limit)
fileSchema.pre('save', function(next) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (this.size > maxSize) {
        const error = new Error('File size exceeds maximum limit of 10MB');
        error.name = 'ValidationError';
        return next(error);
    }
    next();
});

// Don't include sensitive data in JSON responses
fileSchema.methods.toJSON = function() {
    const file = this.toObject({ virtuals: true });
    delete file.key; // Don't expose S3 key to frontend
    delete file.isDeleted;
    return file;
};

module.exports = mongoose.model('File', fileSchema);