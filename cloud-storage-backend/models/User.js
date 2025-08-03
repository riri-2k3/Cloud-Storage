const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });

// Don't return password in JSON responses
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);