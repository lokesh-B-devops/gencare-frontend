const mongoose = require('mongoose');

const PhaseSchema = new mongoose.Schema({
    label: { type: String, required: true }, // e.g., "Stimulation", "Waiting Period"
    durationDays: { type: Number, required: true },
    advice: { type: String }, // Doctor-approved messages
    dosAndDonts: [String],
    isWaitingPhase: { type: Boolean, default: false }
});

const TreatmentTimelineSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Standard IVF Protocol"
    phases: [PhaseSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('TreatmentTimeline', TreatmentTimelineSchema);
