const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class EmbryoTransferRepository extends BaseRepository {
    constructor() {
        super('embryoTransferGuidance', prisma);
    }

    async findByPatientAndDoctor(patientId, doctorId) {
        try {
            return await this.prisma.embryoTransferGuidance.findFirst({
                where: { patientId, doctorId },
                orderBy: { createdAt: 'desc' }
            });
        } catch (err) {
            console.error(`PostgreSQL findByPatientAndDoctor error: ${err.message}`);
            throw err;
        }
    }

    async findLatestForPatient(patientId) {
        try {
            return await this.prisma.embryoTransferGuidance.findFirst({
                where: { patientId },
                orderBy: { createdAt: 'desc' }
            });
        } catch (err) {
            console.error(`PostgreSQL findLatestForPatient error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new EmbryoTransferRepository();
