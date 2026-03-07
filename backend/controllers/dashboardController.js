const patientRepository = require('../repositories/PatientRepository');
const doctorRepository = require('../repositories/DoctorRepository');
const guardianRepository = require('../repositories/GuardianRepository');
const adherenceRepository = require('../repositories/AdherenceRepository');


exports.getPatientDashboard = async (req, res) => {
    try {
        const profile = await patientRepository.findByUserId(req.user.id);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // Fetch latest adherence score
        const logs = await adherenceRepository.findToday(req.user.id);
        const adherenceScore = logs ? (logs.dailyScore || 100) : 100;

        const dashboardData = {
            ...(profile.toObject ? profile.toObject() : profile),
            currentAdherenceScore: adherenceScore
        };

        res.json(dashboardData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDoctorDashboard = async (req, res) => {
    try {
        const profile = await doctorRepository.findByUserId(req.user.id);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        const profileData = profile.toObject ? profile.toObject() : profile;
        const patients = profileData.patients || [];

        // Enrich patients with adherence data
        const enrichedPatients = await Promise.all(
            patients
                .filter(p => p && (p.user || p.userId))
                .map(async (p) => {
                    const patientId = p.user?._id || p.user || p.userId;
                    const logs = await adherenceRepository.findByPatient(patientId, 7);

                    const patientData = p.toObject ? p.toObject() : p;
                    patientData.adherenceScore = logs.length > 0 ? logs[0].dailyScore : 100;
                    patientData.riskTrend = logs.map(l => ({ date: l.date, score: l.dailyScore })).reverse();

                    // Add lastSync info from the most recent syncedAt in any log
                    let lastSyncDate = null;
                    logs.forEach(log => {
                        log.medicationLogs?.forEach(ml => {
                            if (ml.syncedAt) {
                                const sDate = new Date(ml.syncedAt);
                                if (!lastSyncDate || sDate > lastSyncDate) lastSyncDate = sDate;
                            }
                        });
                    });
                    patientData.lastSync = lastSyncDate;

                    return patientData;
                })
        );

        const dashboardData = {
            ...profileData,
            patients: enrichedPatients
        };

        res.json(dashboardData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGuardianDashboard = async (req, res) => {
    try {
        const profile = await guardianRepository.findByUserId(req.user.id);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        const profileData = profile.toObject ? profile.toObject() : profile;

        // Enrich with adherence data if linkedPatient exists
        if (profileData.linkedPatient) {
            const patientId = profileData.linkedPatient.user?._id || profileData.linkedPatient.user || profileData.linkedPatient.userId;
            const logs = await adherenceRepository.findByPatient(patientId, 7);

            const enrichedPatient = profileData.linkedPatient.toObject ? profileData.linkedPatient.toObject() : profileData.linkedPatient;
            enrichedPatient.adherenceScore = logs.length > 0 ? logs[0].dailyScore : 100;
            enrichedPatient.riskTrend = logs.map(l => ({ date: l.date, score: l.dailyScore })).reverse();
            profileData.linkedPatient = enrichedPatient;
        }

        res.json(profileData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
