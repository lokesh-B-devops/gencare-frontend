const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class NotificationPreferenceRepository extends BaseRepository {
    constructor() {
        super('notificationPreference', prisma);
    }

    _mapDataToPg(data) {
        const mapped = super._mapDataToPg(data);

        if (data.patient && !mapped.patientId) {
            mapped.patientId = data.patient.toString();
            delete mapped.patient;
        }

        // WhatsApp Consent mapping
        if (data.whatsappConsent) {
            mapped.whatsappConsentGiven = data.whatsappConsent.given;
            mapped.whatsappConsentTime = data.whatsappConsent.timestamp;
            delete mapped.whatsappConsent;
        }

        // SMS Consent mapping
        if (data.smsConsent) {
            mapped.smsConsentGiven = data.smsConsent.given;
            mapped.smsConsentTime = data.smsConsent.timestamp;
            delete mapped.smsConsent;
        }

        return mapped;
    }

    async findByPatient(patientId) {
        try {
            return await this.prisma.notificationPreference.findUnique({
                where: { patientId }
            });
        } catch (err) {
            console.error(`PostgreSQL findByPatient error in NotificationPreference: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new NotificationPreferenceRepository();
