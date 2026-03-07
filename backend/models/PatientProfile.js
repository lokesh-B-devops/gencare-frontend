const mongoose = require('mongoose');

const PatientProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pregnancyMonth: { type: String }, // e.g., "Month 3", "Week 12"
    age: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    pastMedicalConditions: [String], // PCOS, thyroid, diabetes, anemia, etc.
    lifestyle: {
        sleepHours: Number,
        activityLevel: { type: String, enum: ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'] },
        stressLevel: { type: String, enum: ['Low', 'Moderate', 'High'] }
    },
    hormoneLevels: {
        amh: Number,
        fsh: Number,
        lh: Number,
        estradiol: Number,
        progesterone: Number
    },
    ivfDetails: {
        stage: { type: String }, // e.g., "Stimulation", "Retrieval"
        cycleNumber: { type: Number },
        medications: [{ name: String, dosage: String, time: String, confirmedAt: Date }]
    },
    emergencyContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Linked Guardians
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    medicalNotes: { type: String },
    timeline: {
        currentDay: { type: Number, default: 1 },
        phase: { type: String, default: 'Stimulation' },
        startDate: { type: Date, default: Date.now },
        config: { type: mongoose.Schema.Types.ObjectId, ref: 'TreatmentTimeline' }
    },
    stressMode: { type: Boolean, default: false },
    payments: [{
        category: String,
        amount: Number,
        status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
        dueDate: Date,
        paidDate: Date
    }],
    lastKnownLocation: {
        latitude: Number,
        longitude: Number,
        timestamp: Date
    },
    hasDonorInvolvement: { type: Boolean, default: false },
    hasSurrogateInvolvement: { type: Boolean, default: false },
    postDeliveryMode: { type: Boolean, default: false },
    deliveryDate: { type: Date },
    newbornChecklistProgress: { type: Map, of: Boolean, default: {} }
});

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);
