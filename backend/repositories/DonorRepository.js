const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class DonorRepository extends BaseRepository {
    constructor() {
        super('donorProfile', prisma);
    }

    _mapDataToPg(data) {
        const mapped = super._mapDataToPg(data);

        if (data.patient && !mapped.patientId) {
            mapped.patientId = data.patient.toString();
            delete mapped.patient;
        }

        return mapped;
    }

    async findByPatient(patientId, publishedOnly = false) {
        try {
            const query = { patientId };
            if (publishedOnly) query.isPublished = true;

            const result = await this.prisma.donorProfile.findMany({
                where: query,
                take: 1
            });
            return result[0] || null;
        } catch (err) {
            console.error(`PostgreSQL Donor findByPatient error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new DonorRepository();
