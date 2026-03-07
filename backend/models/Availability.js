const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // HH:mm format
    endTime: { type: String, required: true },   // HH:mm format
    status: {
        type: String,
        enum: ['available', 'busy', 'leave'],
        default: 'available'
    },
    isRecurring: { type: Boolean, default: false },
    recurringDays: [{ type: Number }], // 0-6 (Sun-Sat)
    createdAt: { type: Date, default: Date.now }
});

// Ensure no overlapping slots for the same doctor on the same date
AvailabilitySchema.index({ doctor: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model('Availability', AvailabilitySchema);
