const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    guardian: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // HH:mm format
    endTime: { type: String }, // Optional, calculated or specified
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'suggested'],
        default: 'pending'
    },
    appointmentType: {
        type: String,
        enum: ['consultation', 'procedure', 'scan', 'egg-retrieval', 'embryo-transfer'],
        default: 'consultation'
    },
    isCritical: { type: Boolean, default: false }, // For IVF specific rules (Egg Retrieval, etc.)
    notes: { type: String },
    rejectionReason: { type: String },
    suggestedTime: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
