const mongoose = require('mongoose');

const SurrogateProfileSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ageRange: { type: String },
    bloodGroup: { type: String },
    geneticScreening: { type: String },
    medicalFitness: { type: String },
    infectiousDiseaseClearance: { type: String },
    matchingScore: { type: Number, min: 0, max: 100 },
    doctorNotes: { type: String },
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

SurrogateProfileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('SurrogateProfile', SurrogateProfileSchema);
