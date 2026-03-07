const cron = require('node-cron');
const moment = require('moment-timezone');
const userRepository = require('../repositories/UserRepository');
const patientRepository = require('../repositories/PatientRepository');
const guardianRepository = require('../repositories/GuardianRepository');
const notificationPreferenceRepository = require('../repositories/NotificationPreferenceRepository');
const notificationLogRepository = require('../repositories/NotificationLogRepository');
const notificationService = require('./notificationService');

// Escalation time windows (in minutes after scheduled medication time)
const ESCALATION_CONFIG = {
    FIRST_REMINDER: 0,       // At reminder time
    SECOND_REMINDER: 15,     // 15 min after med time if not confirmed
    GUARDIAN_ESCALATION: 30,  // 30 min after med time
    DOCTOR_ESCALATION: 45    // 45 min after med time
};

let schedulerTask = null;

// ─── Main Scheduler ─────────────────────────────────────────────────────────

function startScheduler() {
    if (schedulerTask) {
        console.log('[Scheduler] Already running');
        return;
    }

    console.log('[Scheduler] Starting medication notification scheduler (runs every minute)');

    // Run every minute
    schedulerTask = cron.schedule('* * * * *', async () => {
        try {
            await processNotifications();
        } catch (err) {
            console.error('[Scheduler] Error in notification processing:', err.message);
        }
    });

    console.log('[Scheduler] Medication notification scheduler started successfully');
}

function stopScheduler() {
    if (schedulerTask) {
        schedulerTask.stop();
        schedulerTask = null;
        console.log('[Scheduler] Stopped');
    }
}

// ─── Core Processing ────────────────────────────────────────────────────────

async function processNotifications() {
    // Get all patients with notification preferences enabled
    const preferences = await notificationPreferenceRepository.findAll({
        OR: [{ whatsappEnabled: true }, { smsEnabled: true }]
    });

    if (preferences.length === 0) return;

    for (const pref of preferences) {
        try {
            await processPatientNotifications(pref);
        } catch (err) {
            console.error(`[Scheduler] Error processing patient ${pref.patient}:`, err.message);
        }
    }
}

async function processPatientNotifications(preference) {
    const patientUser = await userRepository.findById(preference.patientId || preference.patient);
    if (!patientUser) return;

    const patientProfile = await patientRepository.findByUserId(preference.patientId || preference.patient);
    if (!patientProfile || !patientProfile.ivfDetails?.medications?.length) return;

    const timezone = patientUser.timezone || 'Asia/Kolkata';
    const now = moment().tz(timezone);

    // Check quiet hours
    if (isQuietHours(now, preference.quietHoursStart, preference.quietHoursEnd)) return;

    for (const medication of patientProfile.ivfDetails.medications) {
        try {
            await processMedicationReminder(patientUser, patientProfile, medication, preference, now, timezone);
        } catch (err) {
            console.error(`[Scheduler] Error processing medication ${medication.name}:`, err.message);
        }
    }
}

async function processMedicationReminder(patientUser, patientProfile, medication, preference, now, timezone) {
    const medTime = parseMedicationTime(medication.time, timezone);
    if (!medTime) return;

    const reminderTime = moment(medTime).subtract(preference.reminderMinutesBefore, 'minutes');
    const todayKey = now.format('YYYY-MM-DD');

    // Check if medication has been confirmed today
    const isConfirmed = medication.confirmedAt &&
        moment(medication.confirmedAt).tz(timezone).format('YYYY-MM-DD') === todayKey;
    if (isConfirmed) return;

    const minutesSinceMedTime = now.diff(medTime, 'minutes');
    const minutesSinceReminderTime = now.diff(reminderTime, 'minutes');

    // ─── Stage 1: Initial Reminder ──────────────────────────────
    if (minutesSinceReminderTime >= 0 && minutesSinceReminderTime < 1) {
        const alreadySent = await hasNotificationBeenSent(
            patientUser.id || patientUser._id, medication.name, medication.time, 'reminder', todayKey
        );
        if (!alreadySent) {
            console.log(`[Scheduler] Sending initial reminder for ${medication.name} to ${patientUser.name}`);
            await notificationService.sendMedicationReminder(patientUser, medication, preference);
        }
    }

    // ─── Stage 2: Second Reminder to Patient ────────────────────
    if (minutesSinceMedTime >= ESCALATION_CONFIG.SECOND_REMINDER &&
        minutesSinceMedTime < ESCALATION_CONFIG.SECOND_REMINDER + 1) {
        const alreadySent = await hasNotificationBeenSent(
            patientUser.id || patientUser._id, medication.name, medication.time, 'reminder', todayKey, 2
        );
        if (!alreadySent) {
            console.log(`[Scheduler] Sending second reminder for ${medication.name} to ${patientUser.name}`);
            await notificationService.sendMedicationReminder(patientUser, medication, preference);
        }
    }

    // ─── Stage 3: Guardian Escalation ───────────────────────────
    if (minutesSinceMedTime >= ESCALATION_CONFIG.GUARDIAN_ESCALATION &&
        minutesSinceMedTime < ESCALATION_CONFIG.GUARDIAN_ESCALATION + 1) {
        const alreadySent = await hasNotificationBeenSent(
            patientUser.id || patientUser._id, medication.name, medication.time, 'escalation_guardian', todayKey
        );
        if (!alreadySent) {
            console.log(`[Scheduler] Escalating to guardian for ${medication.name} - patient ${patientUser.name}`);
            await escalateToGuardians(patientUser, patientProfile, medication);
        }
    }

    // ─── Stage 4: Doctor Escalation ─────────────────────────────
    if (minutesSinceMedTime >= ESCALATION_CONFIG.DOCTOR_ESCALATION &&
        minutesSinceMedTime < ESCALATION_CONFIG.DOCTOR_ESCALATION + 1) {
        const alreadySent = await hasNotificationBeenSent(
            patientUser.id || patientUser._id, medication.name, medication.time, 'escalation_doctor', todayKey
        );
        if (!alreadySent) {
            console.log(`[Scheduler] Escalating to doctor for ${medication.name} - patient ${patientUser.name}`);
            await escalateToDoctor(patientUser, patientProfile, medication);
        }
    }
}

// ─── Escalation Helpers ─────────────────────────────────────────────────────

async function escalateToGuardians(patientUser, patientProfile, medication) {
    // Find guardians via emergencyContacts or GuardianProfile
    const guardianProfiles = await guardianRepository.findAll({ linkedPatient: patientProfile.id || patientProfile._id });
    const guardianUserIds = guardianProfiles.map(g => g.userId || g.user);

    // Also include emergencyContacts from patient profile
    const allGuardianIds = [...new Set([
        ...guardianUserIds.map(id => id.toString()),
        ...(patientProfile.emergencyContacts || []).map(id => id.toString())
    ])];

    if (allGuardianIds.length === 0) {
        console.log(`[Scheduler] No guardians found for patient ${patientUser.name}, skipping guardian escalation`);
        return;
    }

    for (const guardianId of allGuardianIds) {
        const guardianUser = await userRepository.findById(guardianId);
        if (guardianUser) {
            await notificationService.sendGuardianEscalation(guardianUser, patientUser, medication);
        }
    }
}

async function escalateToDoctor(patientUser, patientProfile, medication) {
    if (!patientProfile.assignedDoctor) {
        console.log(`[Scheduler] No assigned doctor for patient ${patientUser.name}, skipping doctor escalation`);
        return;
    }

    const doctorUser = await userRepository.findById(patientProfile.assignedDoctorId || patientProfile.assignedDoctor);
    if (doctorUser) {
        await notificationService.sendDoctorEscalation(doctorUser, patientUser, medication);
    }
}

// ─── Utility Functions ──────────────────────────────────────────────────────

function parseMedicationTime(timeStr, timezone) {
    if (!timeStr) return null;
    try {
        // Parse "07:00 PM" or "09:00 AM" format
        const today = moment().tz(timezone).format('YYYY-MM-DD');
        const parsed = moment.tz(`${today} ${timeStr}`, 'YYYY-MM-DD hh:mm A', timezone);
        return parsed.isValid() ? parsed : null;
    } catch (err) {
        return null;
    }
}

function isQuietHours(now, startStr, endStr) {
    if (!startStr || !endStr) return false;

    const currentMinutes = now.hours() * 60 + now.minutes();
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
        // Same day range (e.g., 08:00 to 18:00)
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
        // Overnight range (e.g., 22:00 to 07:00)
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
}

async function hasNotificationBeenSent(patientId, medName, medTime, messageType, todayKey, minCount = 1) {
    const startOfDay = moment(todayKey, 'YYYY-MM-DD').startOf('day').toDate();
    const endOfDay = moment(todayKey, 'YYYY-MM-DD').endOf('day').toDate();

    const count = await notificationLogRepository.count({
        patientId: patientId,
        medicationName: medName,
        scheduledMedTime: medTime,
        messageType: messageType,
        createdAt: { gte: startOfDay, lte: endOfDay }
    });

    return count >= minCount;
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
    startScheduler,
    stopScheduler,
    processNotifications, // Exposed for testing
    ESCALATION_CONFIG
};
