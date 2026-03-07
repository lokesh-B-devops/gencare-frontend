const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class NotificationLogRepository extends BaseRepository {
    constructor() {
        super('notificationLog', prisma);
    }

    _mapDataToPg(data) {
        const mapped = super._mapDataToPg(data);

        if (data.patient && !mapped.patientId) {
            mapped.patientId = data.patient.toString();
            delete mapped.patient;
        }

        if (data.recipient && !mapped.recipientId) {
            mapped.recipientId = data.recipient.toString();
            delete mapped.recipient;
        }

        return mapped;
    }
}

module.exports = new NotificationLogRepository();
