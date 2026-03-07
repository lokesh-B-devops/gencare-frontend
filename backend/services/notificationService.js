const notificationLogRepository = require('../repositories/NotificationLogRepository');
const doctorAlertRepository = require('../repositories/DoctorAlertRepository');

// Twilio client - initialized lazily if credentials exist
let twilioClient = null;

function getTwilioClient() {
    if (twilioClient) return twilioClient;
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        try {
            const twilio = require('twilio');
            twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
            console.log('[NotificationService] Twilio client initialized');
        } catch (err) {
            console.warn('[NotificationService] Twilio SDK not available, running in simulation mode');
        }
    }
    return twilioClient;
}

function isSimulationMode() {
    return !getTwilioClient();
}

// ─── Message Templates (no PHI) ────────────────────────────────────────────

function buildPatientReminderMessage(medicationTime) {
    return `Reminder: Your scheduled IVF medication is due at ${medicationTime}. Please confirm in the app.`;
}

function buildGuardianEscalationMessage(patientName, medicationTime) {
    return `Alert: ${patientName} has not confirmed their scheduled medication (due at ${medicationTime}). Please check in with them.`;
}

function buildDoctorEscalationMessage(patientName, medicationTime) {
    return `Escalation: Patient ${patientName} has not confirmed medication due at ${medicationTime} despite multiple reminders. Please review in your dashboard.`;
}

function buildTestMessage() {
    return `This is a test notification from your IVF Care app. If you received this, notifications are working correctly!`;
}

// ─── Core Send Functions ────────────────────────────────────────────────────

async function sendWhatsApp(to, message) {
    const client = getTwilioClient();
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    if (!client) {
        console.log(`[SIMULATION] WhatsApp → ${to}: ${message}`);
        return { sid: `SIM_WA_${Date.now()}`, status: 'sent', simulated: true };
    }

    try {
        const result = await client.messages.create({
            body: message,
            from: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
            to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
        });
        console.log(`[NotificationService] WhatsApp sent → ${to} (SID: ${result.sid})`);
        return { sid: result.sid, status: 'sent' };
    } catch (err) {
        console.error(`[NotificationService] WhatsApp failed → ${to}:`, err.message);
        throw err;
    }
}

async function sendSMS(to, message) {
    const client = getTwilioClient();
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!client) {
        console.log(`[SIMULATION] SMS → ${to}: ${message}`);
        return { sid: `SIM_SMS_${Date.now()}`, status: 'sent', simulated: true };
    }

    try {
        const result = await client.messages.create({
            body: message,
            from: fromNumber,
            to: to
        });
        console.log(`[NotificationService] SMS sent → ${to} (SID: ${result.sid})`);
        return { sid: result.sid, status: 'sent' };
    } catch (err) {
        console.error(`[NotificationService] SMS failed → ${to}:`, err.message);
        throw err;
    }
}

// ─── Retry Wrapper ──────────────────────────────────────────────────────────

async function sendWithRetry(sendFn, to, message, maxRetries = 3) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await sendFn(to, message);
            return { ...result, retryCount: attempt };
        } catch (err) {
            lastError = err;
            if (attempt < maxRetries) {
                const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
                console.log(`[NotificationService] Retry ${attempt + 1}/${maxRetries} in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }
    throw lastError;
}

// ─── High-Level Notification Functions ──────────────────────────────────────

async function sendMedicationReminder(patient, medication, preferences) {
    const message = buildPatientReminderMessage(medication.time);
    const results = [];

    if (preferences.whatsappEnabled && preferences.whatsappConsent?.given) {
        const whatsappTo = patient.whatsappNumber || patient.phone;
        if (whatsappTo) {
            try {
                const result = await sendWithRetry(sendWhatsApp, whatsappTo, message);
                const log = await createNotificationLog({
                    patientId: patient.id || patient._id,
                    recipientId: patient.id || patient._id,
                    recipientRole: 'patient',
                    channel: 'whatsapp',
                    messageType: 'reminder',
                    messageContent: message,
                    status: 'sent',
                    twilioSid: result.sid,
                    retryCount: result.retryCount || 0,
                    medicationName: medication.name,
                    scheduledMedTime: medication.time
                });
                results.push(log);
            } catch (err) {
                const log = await createNotificationLog({
                    patientId: patient.id || patient._id,
                    recipientId: patient.id || patient._id,
                    recipientRole: 'patient',
                    channel: 'whatsapp',
                    messageType: 'reminder',
                    messageContent: message,
                    status: 'failed',
                    errorMessage: err.message,
                    retryCount: 3,
                    medicationName: medication.name,
                    scheduledMedTime: medication.time
                });
                results.push(log);
            }
        }
    }

    if (preferences.smsEnabled && preferences.smsConsent?.given) {
        const smsTo = patient.phone;
        if (smsTo) {
            try {
                const result = await sendWithRetry(sendSMS, smsTo, message);
                const log = await createNotificationLog({
                    patientId: patient.id || patient._id,
                    recipientId: patient.id || patient._id,
                    recipientRole: 'patient',
                    channel: 'sms',
                    messageType: 'reminder',
                    messageContent: message,
                    status: 'sent',
                    twilioSid: result.sid,
                    retryCount: result.retryCount || 0,
                    medicationName: medication.name,
                    scheduledMedTime: medication.time
                });
                results.push(log);
            } catch (err) {
                const log = await createNotificationLog({
                    patientId: patient.id || patient._id,
                    recipientId: patient.id || patient._id,
                    recipientRole: 'patient',
                    channel: 'sms',
                    messageType: 'reminder',
                    messageContent: message,
                    status: 'failed',
                    errorMessage: err.message,
                    retryCount: 3,
                    medicationName: medication.name,
                    scheduledMedTime: medication.time
                });
                results.push(log);
            }
        }
    }

    return results;
}

async function sendGuardianEscalation(guardian, patient, medication) {
    const message = buildGuardianEscalationMessage(patient.name, medication.time);
    const results = [];
    const channels = ['whatsapp', 'sms'];

    for (const channel of channels) {
        const to = channel === 'whatsapp' ? (guardian.whatsappNumber || guardian.phone) : guardian.phone;
        if (!to) continue;

        const sendFn = channel === 'whatsapp' ? sendWhatsApp : sendSMS;
        try {
            const result = await sendWithRetry(sendFn, to, message);
            const log = await createNotificationLog({
                patientId: patient.id || patient._id,
                recipientId: guardian.id || guardian._id,
                recipientRole: 'guardian',
                channel,
                messageType: 'escalation_guardian',
                messageContent: message,
                status: 'sent',
                twilioSid: result.sid,
                retryCount: result.retryCount || 0,
                medicationName: medication.name,
                scheduledMedTime: medication.time
            });
            results.push(log);
        } catch (err) {
            const log = await createNotificationLog({
                patientId: patient.id || patient._id,
                recipientId: guardian.id || guardian._id,
                recipientRole: 'guardian',
                channel,
                messageType: 'escalation_guardian',
                messageContent: message,
                status: 'failed',
                errorMessage: err.message,
                retryCount: 3,
                medicationName: medication.name,
                scheduledMedTime: medication.time
            });
            results.push(log);
        }
    }

    return results;
}

async function sendDoctorEscalation(doctor, patient, medication) {
    const message = buildDoctorEscalationMessage(patient.name, medication.time);
    const results = [];

    // Send SMS to doctor
    if (doctor.phone) {
        try {
            const result = await sendWithRetry(sendSMS, doctor.phone, message);
            const log = await createNotificationLog({
                patientId: patient.id || patient._id,
                recipientId: doctor.id || doctor._id,
                recipientRole: 'doctor',
                channel: 'sms',
                messageType: 'escalation_doctor',
                messageContent: message,
                status: 'sent',
                twilioSid: result.sid,
                retryCount: result.retryCount || 0,
                medicationName: medication.name,
                scheduledMedTime: medication.time
            });
            results.push(log);
        } catch (err) {
            await createNotificationLog({
                patientId: patient.id || patient._id,
                recipientId: doctor.id || doctor._id,
                recipientRole: 'doctor',
                channel: 'sms',
                messageType: 'escalation_doctor',
                messageContent: message,
                status: 'failed',
                errorMessage: err.message,
                retryCount: 3,
                medicationName: medication.name,
                scheduledMedTime: medication.time
            });
        }
    }

    // Create dashboard alert
    try {
        const alert = await doctorAlertRepository.create({
            doctor: doctor.id || doctor._id,
            doctorId: doctor.id || doctor._id,
            patient: patient.id || patient._id,
            patientId: patient.id || patient._id,
            alertType: 'medication_escalation',
            message: `Patient ${patient.name} has not confirmed medication "${medication.name}" due at ${medication.time} despite multiple reminders.`,
            severity: 'high',
            medicationName: medication.name,
            scheduledTime: medication.time
        });
        console.log(`[NotificationService] Doctor alert created for Dr. ${doctor.name} regarding ${patient.name}`);
        results.push(alert);
    } catch (err) {
        console.error('[NotificationService] Failed to create doctor alert:', err.message);
    }

    return results;
}

async function sendTestNotification(to, channel) {
    const message = buildTestMessage();
    const sendFn = channel === 'whatsapp' ? sendWhatsApp : sendSMS;
    return await sendFn(to, message);
}

// ─── Logging Helper ─────────────────────────────────────────────────────────

async function createNotificationLog(data) {
    try {
        const log = await notificationLogRepository.create({
            ...data,
            sentAt: data.status === 'sent' ? new Date() : undefined
        });
        return log;
    } catch (err) {
        console.error('[NotificationService] Failed to create log:', err.message);
        return null;
    }
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
    sendWhatsApp,
    sendSMS,
    sendMedicationReminder,
    sendGuardianEscalation,
    sendDoctorEscalation,
    sendTestNotification,
    isSimulationMode,
    buildPatientReminderMessage,
    buildGuardianEscalationMessage,
    buildDoctorEscalationMessage
};
