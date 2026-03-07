const mongoose = require('mongoose');

const MedicationEducationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    stage: { type: String, required: true },
    dosage: { type: String },
    purpose: { type: String, required: true },
    howItWorks: { type: String, required: true },
    stageRelevance: { type: String, required: true },
    sideEffects: { type: String, required: true },
    tips: { type: String, required: true },
    disclaimer: {
        type: String,
        default: "This explanation is for understanding only and does not replace doctor advice."
    },
    lastUpdated: { type: Date, default: Date.now }
});

// Unique index for the combination of name and stage
MedicationEducationSchema.index({ name: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model('MedicationEducation', MedicationEducationSchema);
