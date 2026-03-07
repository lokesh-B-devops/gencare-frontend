const mongoose = require('mongoose');

const NotificationPreferenceSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    whatsappEnabled: { type: Boolean, default: false },
    smsEnabled: { type: Boolean, default: false },
    reminderMinutesBefore: { type: Number, default: 10, enum: [5, 10, 15, 30] },
    whatsappConsent: {
        given: { type: Boolean, default: false },
        timestamp: { type: Date }
    },
    smsConsent: {
        given: { type: Boolean, default: false },
        timestamp: { type: Date }
    },
    quietHoursStart: { type: String, default: '22:00' }, // HH:mm
    quietHoursEnd: { type: String, default: '07:00' },
    updatedAt: { type: Date, default: Date.now }
});

NotificationPreferenceSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('NotificationPreference', NotificationPreferenceSchema);
