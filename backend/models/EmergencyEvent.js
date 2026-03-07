const mongoose = require('mongoose');

const EmergencyEventSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
    triggeredBy: { type: String, enum: ['SOS_BUTTON', 'VOLUME_BUTTON'], required: true },
    timestamp: { type: Date, default: Date.now },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ['requested', 'ambulance_assigned', 'resolved'],
        default: 'requested'
    },
    logs: [{ message: String, timestamp: Date }] // Audit trail
});

module.exports = mongoose.model('EmergencyEvent', EmergencyEventSchema);
