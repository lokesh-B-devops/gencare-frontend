const mongoose = require('mongoose');

const MedicalReportSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    aiAnalysis: {
        summary: String,
        details: String,
        recommendations: [String],
        analyzedAt: { type: Date, default: Date.now }
    },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalReport', MedicalReportSchema);
