const mongoose = require('mongoose');

const GuardianProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    linkedPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientProfile' },
    relation: { type: String, default: 'Guardian' } // e.g., "Husband", "Mother"
});

module.exports = mongoose.model('GuardianProfile', GuardianProfileSchema);
