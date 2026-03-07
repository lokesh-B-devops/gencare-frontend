const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class EmergencyRepository extends BaseRepository {
    constructor() {
        super('emergencyEvent', prisma);
    }

    _mapDataToPg(data) {
        const mapped = super._mapDataToPg(data);

        // Flatten location if it exists
        if (data.location) {
            mapped.latitude = data.location.latitude;
            mapped.longitude = data.location.longitude;
            delete mapped.location;
        }

        if (data.patient && !mapped.patientProfileId) {
            mapped.patientProfileId = data.patient.toString();
            delete mapped.patient;
        }

        return mapped;
    }

    async create(data) {
        try {
            const { logs, ...rest } = data;
            const pgData = this._mapDataToPg(rest);

            return await this.prisma.emergencyEvent.create({
                data: {
                    ...pgData,
                    logs: logs ? {
                        create: logs.map(l => this._mapDataToPg(l))
                    } : undefined
                }
            });
        } catch (err) {
            console.error(`PostgreSQL EmergencyEvent create error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new EmergencyRepository();
