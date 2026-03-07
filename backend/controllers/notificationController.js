const notificationPreferenceRepository = require('../repositories/NotificationPreferenceRepository');
const notificationLogRepository = require('../repositories/NotificationLogRepository');
const doctorAlertRepository = require('../repositories/DoctorAlertRepository');
const patientRepository = require('../repositories/PatientRepository');
const notificationService = require('../services/notificationService');

// ─── Patient Preferences ───────────────────────────────────────────────────

exports.getPreferences = async (req, res) => {
    try {
        let prefs = await notificationPreferenceRepository.findByPatient(req.user.id);
        if (!prefs) {
            prefs = await notificationPreferenceRepository.create({ patient: req.user.id });
        }
        res.json(prefs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { whatsappEnabled, smsEnabled, reminderMinutesBefore, quietHoursStart, quietHoursEnd } = req.body;

        let prefs = await notificationPreferenceRepository.findByPatient(req.user.id);
        if (!prefs) {
            prefs = { patient: req.user.id };
        }

        const updateData = {};

        if (whatsappEnabled !== undefined) {
            updateData.whatsappEnabled = whatsappEnabled;
            if (whatsappEnabled && (!prefs.whatsappConsentGiven && !prefs.whatsappConsent?.given)) {
                updateData.whatsappConsent = { given: true, timestamp: new Date() };
                updateData.whatsappConsentGiven = true;
                updateData.whatsappConsentTime = new Date();
            }
        }

        if (smsEnabled !== undefined) {
            updateData.smsEnabled = smsEnabled;
            if (smsEnabled && (!prefs.smsConsentGiven && !prefs.smsConsent?.given)) {
                updateData.smsConsent = { given: true, timestamp: new Date() };
                updateData.smsConsentGiven = true;
                updateData.smsConsentTime = new Date();
            }
        }

        if (reminderMinutesBefore !== undefined) updateData.reminderMinutesBefore = reminderMinutesBefore;
        if (quietHoursStart !== undefined) updateData.quietHoursStart = quietHoursStart;
        if (quietHoursEnd !== undefined) updateData.quietHoursEnd = quietHoursEnd;

        let updatedPrefs;
        if (prefs._id || prefs.id) {
            updatedPrefs = await notificationPreferenceRepository.update(prefs._id || prefs.id, updateData);
        } else {
            updatedPrefs = await notificationPreferenceRepository.create({ ...prefs, ...updateData });
        }
        res.json({ message: 'Preferences updated', preferences: updatedPrefs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── Notification Logs ──────────────────────────────────────────────────────

exports.getLogs = async (req, res) => {
    try {
        const { limit = 50, page = 1, channel, status } = req.query;
        const query = {};

        // Patients see their own logs, doctors see logs for their patients
        if (req.user.role === 'patient') {
            query.patient = req.user.id;
        } else if (req.user.role === 'doctor') {
            query.recipientRole = 'doctor';
            query.recipient = req.user.id;
        }

        if (channel) query.channel = channel;
        if (status) query.status = status;

        const logs = await notificationLogRepository.findAll(query);
        // Page/Limit/Count should be handled in repository or helper
        const total = logs.length; // Simplified for now
        res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });

        res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── Medication Confirmation ────────────────────────────────────────────────

exports.confirmMedication = async (req, res) => {
    try {
        const { medicationName } = req.body;
        const patientId = req.user.id;

        const profile = await patientRepository.findByUserId(patientId);
        if (!profile) return res.status(404).json({ message: 'Patient profile not found' });

        const medications = profile.ivfDetails?.medications || [];
        const medIndex = medications.findIndex(m => m.name === medicationName);
        if (medIndex === -1) return res.status(404).json({ message: 'Medication not found' });

        medications[medIndex].confirmedAt = new Date();
        await patientRepository.update(profile._id || profile.id, { ivfDetails: { ...profile.ivfDetails, medications } });

        console.log(`[Notification] Medication "${medicationName}" confirmed by patient ${patientId}`);
        res.json({ message: 'Medication confirmed', medication: med });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── Doctor Alerts ──────────────────────────────────────────────────────────

exports.getDoctorAlerts = async (req, res) => {
    try {
        const { unreadOnly, unresolvedOnly } = req.query;
        const query = { doctor: req.user.id };

        if (unreadOnly === 'true') query.isRead = false;
        if (unresolvedOnly !== 'false') query.isResolved = false; // Default to unresolved

        const alerts = await doctorAlertRepository.findAll(query);
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resolveAlert = async (req, res) => {
    try {
        const alert = await doctorAlertRepository.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: 'Alert not found' });

        const doctorUserId = alert.doctor || alert.doctorId;
        if (doctorUserId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedAlert = await doctorAlertRepository.update(req.params.id, {
            isResolved: true,
            isRead: true,
            resolvedAt: new Date(),
            resolvedBy: req.user.id,
            resolvedById: req.user.id
        });

        res.json({ message: 'Alert resolved', alert: updatedAlert });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.markAlertRead = async (req, res) => {
    try {
        const alert = await doctorAlertRepository.findById(req.params.id);
        if (!alert) return res.status(404).json({ message: 'Alert not found' });

        const doctorUserId = alert.doctor || alert.doctorId;
        if (doctorUserId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedAlert = await doctorAlertRepository.update(req.params.id, { isRead: true });

        res.json({ message: 'Alert marked as read', alert: updatedAlert });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── Test Notification ──────────────────────────────────────────────────────

exports.sendTest = async (req, res) => {
    try {
        const { channel, to } = req.body;
        if (!channel || !to) {
            return res.status(400).json({ message: 'channel and to are required' });
        }

        const result = await notificationService.sendTestNotification(to, channel);
        res.json({
            message: 'Test notification sent',
            simulated: notificationService.isSimulationMode(),
            result
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── Get Simulation Status ──────────────────────────────────────────────────

exports.getStatus = async (req, res) => {
    res.json({
        simulationMode: notificationService.isSimulationMode(),
        message: notificationService.isSimulationMode()
            ? 'Running in simulation mode. Set Twilio credentials in .env for live messaging.'
            : 'Connected to Twilio. Live messaging is active.'
    });
};
