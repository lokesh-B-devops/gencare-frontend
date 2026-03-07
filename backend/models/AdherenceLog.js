const mongoose = require('mongoose');

const AdherenceLogSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    medicationLogs: [{
        medName: { type: String, required: true },
        scheduledTime: { type: String }, // e.g., "08:00 AM"
        actualTime: { type: Date },
        status: {
            type: String,
            enum: ['on-time', 'late', 'missed'],
            default: 'on-time'
        }
    }],
    symptomLogs: [{
        symptom: { type: String },
        severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'] },
        isAbnormal: { type: Boolean, default: false },
        photoPath: { type: String },
        aiAnalysis: {
            summary: String,
            details: String,
            recommendations: [String]
        },
        reportedAt: { type: Date, default: Date.now }
    }],
    dailyScore: { type: Number, default: 100 },
    isEscalated: { type: Boolean, default: false },
    guardianNotified: { type: Boolean, default: false }
});

module.exports = mongoose.model('AdherenceLog', AdherenceLogSchema);
