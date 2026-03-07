const mongoose = require('mongoose');

const NewbornCareGuidanceSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Recovery', 'Hygiene', 'Feeding', 'Sleep', 'Vaccination', 'Emergency']
    },
    title: { type: String, required: true },
    description: { type: String },
    steps: [{
        title: String,
        content: String
    }],
    checklist: [{
        id: String,
        text: String,
        mandatory: { type: Boolean, default: false }
    }],
    safetyDisclaimer: String,
    doctorNotes: String,
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewbornCareGuidance', NewbornCareGuidanceSchema);
