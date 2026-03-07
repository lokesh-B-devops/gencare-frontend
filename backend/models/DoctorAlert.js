const mongoose = require('mongoose');

const DoctorAlertSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alertType: {
        type: String,
        enum: ['medication_escalation', 'missed_dose', 'system_alert'],
        default: 'medication_escalation'
    },
    message: { type: String, required: true },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'high'
    },
    medicationName: { type: String },
    scheduledTime: { type: String },
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

DoctorAlertSchema.index({ doctor: 1, isResolved: 1, createdAt: -1 });

module.exports = mongoose.model('DoctorAlert', DoctorAlertSchema);
