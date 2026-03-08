const adherenceRepository = require('../repositories/AdherenceRepository');
const patientRepository = require('../repositories/PatientRepository');
const aiGuidanceService = require('../services/aiGuidanceService');
const supabaseService = require('../services/supabaseService');

/**
 * Helper: Resolve the PatientProfile ID from the logged-in User ID.
 * AdherenceLog.patientId is a FK to PatientProfile.id, NOT User.id.
 */
async function resolvePatientProfileId(userId) {
    const profile = await patientRepository.findByUserId(userId);
    if (!profile) throw new Error('Patient profile not found. Please complete your registration.');
    return profile.id;
}

exports.logMedication = async (req, res) => {
    try {
        const { medName, status, actualTime } = req.body;
        const userId = req.user.id;
        const patientProfileId = await resolvePatientProfileId(userId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let log = await adherenceRepository.findToday(patientProfileId);

        if (!log) {
            log = { patientId: patientProfileId, date: today, medicationLogs: [], symptomLogs: [], dailyScore: 100 };
        }

        // Ensure arrays exist (guard against Prisma returning no sub-relations)
        if (!log.medicationLogs) log.medicationLogs = [];
        if (!log.symptomLogs) log.symptomLogs = [];

        log.medicationLogs.push({ medName, status, actualTime: actualTime || new Date() });
        log.dailyScore = calculateScore(log);

        // Escalation Logic
        if (status === 'missed') {
            log.isEscalated = true;
            console.log(`[ESCALATION] Missed dose reported for patient ${patientProfileId}. Triggering external notifications.`);

            setImmediate(async () => {
                try {
                    const notificationPreferenceRepository = require('../repositories/NotificationPreferenceRepository');
                    const userRepository = require('../repositories/UserRepository');
                    const guardianRepository = require('../repositories/GuardianRepository');
                    const notificationService = require('../services/notificationService');

                    const patientUser = await userRepository.findById(userId);
                    const patientProfileData = await patientRepository.findByUserId(userId);
                    const prefs = await notificationPreferenceRepository.findOne({ patientId: userId });

                    if (patientUser && prefs && (prefs.whatsappEnabled || prefs.smsEnabled)) {
                        const medication = { name: medName, time: 'now', dosage: '' };
                        await notificationService.sendMedicationReminder(patientUser, medication, prefs);

                        if (patientProfileData) {
                            const profileId = patientProfileData.id;
                            const guardianProfiles = await guardianRepository.findAll({ linkedPatient: profileId });
                            for (const gp of guardianProfiles) {
                                const guardianUserId = gp.user || gp.userId;
                                const guardianUser = await userRepository.findById(guardianUserId);
                                if (guardianUser) {
                                    await notificationService.sendGuardianEscalation(guardianUser, patientUser, medication);
                                    log.guardianNotified = true;
                                }
                            }

                            const doctorId = patientProfileData.assignedDoctorId;
                            if (doctorId) {
                                const doctorUser = await userRepository.findById(doctorId);
                                if (doctorUser) {
                                    await notificationService.sendDoctorEscalation(doctorUser, patientUser, medication);
                                }
                            }
                        }
                    }
                } catch (notifErr) {
                    console.error('[ESCALATION] Notification error:', notifErr.message);
                }
            });
        }

        if (log.id) {
            await adherenceRepository.update(log.id, log);
        } else {
            log = await adherenceRepository.create(log);
        }

        res.status(200).json({ message: 'Medication logged', log });
    } catch (err) {
        console.error('[logMedication] Error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.logSymptom = async (req, res) => {
    console.log('[DEBUG] logSymptom called');
    try {
        const { symptom, severity, isAbnormal } = req.body;
        const userId = req.user.id;
        const patientProfileId = await resolvePatientProfileId(userId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let log = await adherenceRepository.findToday(patientProfileId);

        if (!log) {
            log = { patientId: patientProfileId, date: today, medicationLogs: [], symptomLogs: [], dailyScore: 100 };
        }

        // Ensure arrays exist
        if (!log.medicationLogs) log.medicationLogs = [];
        if (!log.symptomLogs) log.symptomLogs = [];

        const newSymptom = {
            symptom,
            severity: severity ? (severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase()) : 'Moderate',
            isAbnormal: isAbnormal === 'true' || isAbnormal === true,
            reportedAt: new Date()
        };

        if (req.file) {
            newSymptom.photoPath = req.file.path;
        }

        // Analyze with AI Service, map result to schema fields
        let analysisResult = {
            summary: 'Symptom logged for medical review',
            details: 'Your report has been saved. Our care team will monitor this.',
            recommendations: ['Monitor the symptom', 'Follow clinic protocol']
        };

        try {
            const aiResult = await aiGuidanceService.analyzeSymptom(
                symptom,
                req.file ? req.file.path : null,
                req.file ? req.file.mimetype : null
            );
            if (aiResult && aiResult.summary) {
                analysisResult = aiResult;
            }
        } catch (aiErr) {
            console.error('Symptom AI Analysis Error:', aiErr.message);
        }

        // Map to Prisma schema fields (String columns, not a JSON object)
        newSymptom.aiSummary = analysisResult.summary || 'Symptom logged';
        newSymptom.aiDetails = analysisResult.details || 'Recorded for review';

        log.symptomLogs.push(newSymptom);
        log.dailyScore = calculateScore(log);

        if (log.id) {
            await adherenceRepository.update(log.id, log);
        } else {
            log = await adherenceRepository.create(log);
        }

        res.status(200).json({ message: 'Symptom logged and analyzed', log, analysis: analysisResult });
    } catch (err) {
        console.error('[logSymptom] CRITICAL ERROR:', {
            message: err.message,
            stack: err.stack,
            code: err.code,
            meta: err.meta
        });
        res.status(500).json({ message: err.message });
    }
};


exports.getAdherenceSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await patientRepository.findByUserId(userId);
        const patientProfileId = profile ? profile.id : null;

        if (!patientProfileId) {
            return res.status(200).json({ currentScore: 100, riskStatus: 'Low', riskTrend: [] });
        }

        const logs = await adherenceRepository.findByPatient(patientProfileId, 7);

        const currentScore = logs.length > 0 ? logs[0].dailyScore : 100;
        const riskTrend = logs.map(l => ({ date: l.date, score: l.dailyScore })).reverse();

        let riskStatus = 'Low';
        if (currentScore < 60) riskStatus = 'High';
        else if (currentScore < 85) riskStatus = 'Medium';

        res.status(200).json({ currentScore, riskStatus, riskTrend });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.calculateScore = calculateScore;

exports.syncMedications = async (req, res) => {
    try {
        const { logs } = req.body;
        const userId = req.user.id;
        const patientProfileId = await resolvePatientProfileId(userId);

        if (!logs || !Array.isArray(logs)) {
            return res.status(400).json({ message: 'Invalid logs format' });
        }

        console.log(`[Sync] Processing ${logs.length} synced logs for patient ${patientProfileId}`);

        for (const logItem of logs) {
            const { medName, status, actualTime, offlineTimestamp } = logItem;
            const logDate = new Date(offlineTimestamp || actualTime || new Date());
            const today = new Date(logDate);
            today.setHours(0, 0, 0, 0);

            let log = await adherenceRepository.findToday(patientProfileId, today);

            if (!log) {
                log = { patientId: patientProfileId, date: today, medicationLogs: [], symptomLogs: [], dailyScore: 100 };
            }

            if (!log.medicationLogs) log.medicationLogs = [];
            if (!log.symptomLogs) log.symptomLogs = [];

            const isDuplicate = log.medicationLogs.some(ml =>
                ml.medName === medName &&
                new Date(ml.actualTime).getTime() === new Date(actualTime || logDate).getTime()
            );

            if (!isDuplicate) {
                log.medicationLogs.push({
                    medName,
                    status,
                    actualTime: actualTime || logDate,
                    syncedAt: new Date()
                });
                log.dailyScore = calculateScore(log);

                if (log.id) {
                    await adherenceRepository.update(log.id, log);
                } else {
                    await adherenceRepository.create(log);
                }
            }
        }

        res.status(200).json({ message: 'Sync complete' });
    } catch (err) {
        console.error('[Sync] Error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

function calculateScore(log) {
    let score = 100;

    (log.medicationLogs || []).forEach(med => {
        if (med.status === 'missed') score -= 15;
        if (med.status === 'late') score -= 5;
    });

    (log.symptomLogs || []).forEach(symptom => {
        if (symptom.isAbnormal) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
}
