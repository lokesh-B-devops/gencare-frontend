const embryoTransferRepository = require('../repositories/EmbryoTransferRepository');
const patientRepository = require('../repositories/PatientRepository');
const medicalReportRepository = require('../repositories/MedicalReportRepository');
const aiGuidanceService = require('../services/aiGuidanceService');

exports.generateGuidance = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        const patient = await patientRepository.findById(patientId);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        // Gather patient data for AI
        // Look for embryo-specific info in medical reports
        const reports = await medicalReportRepository.findAll({ patientProfileId: patientId });
        let embryoInfo = "";
        reports.forEach(r => {
            if (r.aiAnalysis && r.aiAnalysis.summary) {
                embryoInfo += r.aiAnalysis.summary + " ";
            }
        });

        const patientData = {
            age: patient.age || 35,
            cycleNumber: patient.ivfDetails ? patient.ivfDetails.cycleNumber || 1 : 1,
            embryoStage: embryoInfo.includes('Day 5') ? 'Day 5' : (embryoInfo.includes('Day 3') ? 'Day 3' : 'Day 5 (Estimated)'),
            embryoQuality: embryoInfo.includes('Grade A') ? 'Grade A' : (embryoInfo.includes('Good') ? 'Good' : 'Moderate'),
            uterineHealth: patient.medicalNotes ? (patient.medicalNotes.includes('Normal') ? 'Normal' : 'Requires Review') : 'Normal',
            riskFactors: patient.pastMedicalConditions || []
        };

        const guidance = await aiGuidanceService.generateEmbryoGuidance(patientData);

        // Save to database
        const newGuidance = await embryoTransferRepository.create({
            patient: patientId,
            doctor: doctorId,
            ...patientData,
            ...guidance
        });

        // Supabase Parallel Sync: Embryo Guidance
        if (supabaseService.enabled) {
            supabaseService.upsertProfile('embryos', {
                id: (newGuidance._id || newGuidance.id).toString(),
                patient_id: patientId,
                treatment_id: null, // Optional if not linked yet
                stage: patientData.embryoStage,
                quality: patientData.embryoQuality,
                uterine_health: patientData.uterineHealth,
                ai_guidance: guidance,
                created_at: new Date()
            });
        }

        res.json(newGuidance);
    } catch (err) {
        console.error('Generate Guidance Error:', err);
        res.status(500).json({ message: 'Failed to generate guidance', error: err.message });
    }
};

exports.getLatestGuidance = async (req, res) => {
    try {
        const { patientId } = req.params;
        const guidance = await embryoTransferRepository.findLatestForPatient(patientId);
        if (!guidance) return res.status(404).json({ message: 'No guidance found for this patient' });
        res.json(guidance);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateDecision = async (req, res) => {
    try {
        const { id } = req.params;
        const { finalEmbryoCount, doctorNotes, doctorConfirmation } = req.body;

        const updated = await embryoTransferRepository.update(id, {
            finalEmbryoCount,
            doctorNotes,
            doctorConfirmation,
            confirmedAt: doctorConfirmation ? new Date() : null
        });

        // Supabase Parallel Sync: Doctor Decision
        if (supabaseService.enabled) {
            supabaseService.upsertProfile('embryos', {
                id: id.toString(),
                doctor_decision: {
                    finalEmbryoCount,
                    doctorNotes,
                    doctorConfirmation,
                    confirmedAt: doctorConfirmation ? new Date() : null
                }
            });
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update decision' });
    }
};

exports.patientAcknowledge = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await embryoTransferRepository.update(id, {
            patientAcknowledged: true,
            acknowledgedAt: new Date()
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Failed to acknowledge' });
    }
};
