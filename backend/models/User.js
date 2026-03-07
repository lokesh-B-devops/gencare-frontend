const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'guardian'], required: true },
    phone: { type: String },
    profilePicture: { type: String },
    whatsappNumber: { type: String }, // May differ from phone
    timezone: { type: String, default: 'Asia/Kolkata' },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

UserSchema.virtual('doctorProfile', {
    ref: 'DoctorProfile',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

module.exports = mongoose.model('User', UserSchema);
