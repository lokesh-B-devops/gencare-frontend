const mongoose = require('mongoose');

const EmbryoTransferGuidanceSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientProfile', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Inputs (Snapshots)
    age: Number,
    embryoStage: String, // Day 3 / Day 5
    embryoQuality: String,
    uterineHealth: String,
    riskFactors: [String],

    // AI Guidance
    singleTransferProb: Number,
    doubleTransferProb: Number,
    outcomes: {
        single: String,
        double: String,
        tripletRisk: String
    },
    uncertainty: String,
    maternalRisks: [String],
    neonatalRisks: [String],
    pretermBirthRisk: String,
    disclaimer: { type: String, default: "This AI provides decision-support only and does not diagnose, predict, or guarantee outcomes." },

    // Doctor Decision
    finalEmbryoCount: Number,
    doctorConfirmation: { type: Boolean, default: false },
    confirmedAt: Date,
    doctorNotes: String,

    // Patient Interaction
    patientAcknowledged: { type: Boolean, default: false },
    acknowledgedAt: Date,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

EmbryoTransferGuidanceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('EmbryoTransferGuidance', EmbryoTransferGuidanceSchema);
