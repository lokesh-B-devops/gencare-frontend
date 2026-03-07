const patientRepository = require('../repositories/PatientRepository');
const medicalReportRepository = require('../repositories/MedicalReportRepository');
const medicationEducationRepository = require('../repositories/MedicationEducationRepository');
const aiGuidanceService = require('../services/aiGuidanceService');
const educationService = require('../services/educationService');
const supabaseService = require('../services/supabaseService');

exports.addMedicalNote = async (req, res) => {
    try {
        const { patientId, note } = req.body;
        await patientRepository.update(patientId, { medicalNotes: note });
        res.json({ message: 'Medical notes updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPatientHistory = async (req, res) => {
    try {
        const profile = await patientRepository.findByUserId(req.params.id);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateHealthProfile = async (req, res) => {
    try {
        const { age, height, weight, pastMedicalConditions, lifestyle, hormoneLevels } = req.body;
        const profile = await patientRepository.update(req.user.id, {
            age, height, weight, pastMedicalConditions, lifestyle, hormoneLevels
        });

        // Supabase Parallel Sync: Health Profile
        if (supabaseService.enabled) {
            supabaseService.upsertProfile('patients', {
                user_id: req.user.id, // Primary key in patients is id, but user_id is the reference. 
                // Wait, in my REVISED schema, patients.id is the PK and user_id is FK.
                // In authController I sent user meta to 'users'. 
                // Let's assume patients.id is the MongoDB profile ID if applicable, or we just use user.id as key if 1:1.
                id: req.user.id,
                user_id: req.user.id,
                age,
                height,
                weight,
                past_conditions: pastMedicalConditions,
                lifestyle_data: lifestyle,
                hormone_levels: hormoneLevels,
                created_at: new Date()
            });
        }

        res.json({ message: 'Health profile updated successfully', profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Trigger AI Analysis via Service
        const analysis = await aiGuidanceService.analyzeMedicalDocument(req.file.path, req.file.mimetype);

        const reportData = {
            patient: req.user.id,
            patientProfileId: req.user.id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            filePath: req.file.path,
            mimetype: req.file.mimetype,
            aiAnalysis: analysis
        };

        const report = await medicalReportRepository.create(reportData);

        // Supabase Parallel Sync: Storage & Metadata
        if (supabaseService.enabled) {
            setImmediate(async () => {
                const sbPath = await supabaseService.uploadReport(req.file.path, req.file.filename);
                if (sbPath) {
                    supabaseService.upsertProfile('medical_reports', {
                        id: (report._id || report.id).toString(),
                        patient_id: req.user.id,
                        filename: req.file.filename,
                        storage_path: sbPath,
                        ai_analysis: analysis,
                        uploaded_at: new Date()
                    });
                }
            });
        }

        res.status(201).json({ message: 'Report uploaded and analyzed', report });
    } catch (err) {
        console.error("Upload/Analysis Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getPatientReports = async (req, res) => {
    try {
        const reports = await medicalReportRepository.findAll({ patient: req.user.id });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReportsForDoctor = async (req, res) => {
    try {
        const { patientId } = req.params;
        const reports = await medicalReportRepository.findAll({ patient: patientId });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMedicationEducation = async (req, res) => {
    try {
        const { medName, dosage, stage } = req.query;
        // Ensure inputs are strings and trimmed to prevent whitespace issues
        const name = String(medName || '').trim();
        const medStage = String(stage || '').trim();
        const medDosage = String(dosage || '').trim();

        console.log(`[MedEdu] Request: "${name}", stage: "${medStage}"`);

        if (!name || !medStage) {
            return res.status(400).json({ message: 'medName and stage are required' });
        }

        let education = await medicationEducationRepository.findByNameAndStage(name, medStage);

        if (!education) {
            console.log(`[MedEdu] Generating new content for "${name}"`);
            const aiContent = await educationService.generateMedicationExplanation(name, medDosage, medStage);

            try {
                // Robust mapping with defaults to satisfy Prisma schema
                education = await medicationEducationRepository.create({
                    name: name,
                    stage: medStage,
                    dosage: medDosage,
                    purpose: String(aiContent.purpose || 'Medication support for IVF journey.'),
                    howItWorks: String(aiContent.howItWorks || 'Supports hormonal balance during treatment.'),
                    stageRelevance: String(aiContent.stageRelevance || `Crucial component of the ${medStage} phase.`),
                    sideEffects: String(aiContent.sideEffects || 'Consult your doctor for side effect details.'),
                    tips: String(aiContent.tips || 'Follow your physician\'s timing instructions carefully.')
                });
            } catch (createErr) {
                if (createErr.code === 'P2002') {
                    // Race condition handling
                    education = await medicationEducationRepository.findByNameAndStage(name, medStage);
                } else {
                    console.error(`[MedEdu] Create Error:`, createErr);
                    throw createErr;
                }
            }
        }

        if (!education) throw new Error("Could not retrieve or generate education content.");

        res.json(education);
    } catch (err) {
        console.error("[MedEdu] Top-level Error:", err);
        res.status(500).json({
            error: "Failed to load explanation",
            details: err.message,
            code: err.code,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
