const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientRole: { type: String, enum: ['patient', 'guardian', 'doctor'], required: true },
    channel: { type: String, enum: ['whatsapp', 'sms'], required: true },
    messageType: {
        type: String,
        enum: ['reminder', 'escalation_guardian', 'escalation_doctor', 'test'],
        required: true
    },
    messageContent: { type: String, required: true },
    status: {
        type: String,
        enum: ['queued', 'sent', 'delivered', 'failed'],
        default: 'queued'
    },
    twilioSid: { type: String },
    errorMessage: { type: String },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    medicationName: { type: String },
    scheduledMedTime: { type: String }, // Original medication time e.g. "07:00 PM"
    sentAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
NotificationLogSchema.index({ patient: 1, createdAt: -1 });
NotificationLogSchema.index({ status: 1 });
NotificationLogSchema.index({ patient: 1, medicationName: 1, scheduledMedTime: 1, messageType: 1, createdAt: -1 });

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);
