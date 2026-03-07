const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class SurrogateRepository extends BaseRepository {
    constructor() {
        super('surrogateProfile', prisma);
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

            const result = await this.prisma.surrogateProfile.findMany({
                where: query,
                take: 1
            });
            return result[0] || null;
        } catch (err) {
            console.error(`PostgreSQL Surrogate findByPatient error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new SurrogateRepository();
