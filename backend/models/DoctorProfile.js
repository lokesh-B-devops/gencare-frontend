const mongoose = require('mongoose');

const DoctorProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, default: 'General Care' },
    hospitalName: { type: String, default: 'Hospital' },
    experienceYears: { type: Number, default: 0 },
    bio: { type: String },
    rating: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PatientProfile' }] // List of assigned patients
});

module.exports = mongoose.model('DoctorProfile', DoctorProfileSchema);
