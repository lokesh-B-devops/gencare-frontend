const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class MedicalReportRepository extends BaseRepository {
    constructor() {
        super('medicalReport', prisma);
    }

    async findByPatientProfile(patientProfileId) {
        try {
            return await this.prisma.medicalReport.findMany({
                where: { patientProfileId },
                orderBy: { uploadedAt: 'desc' }
            });
        } catch (err) {
            console.error(`PostgreSQL findByPatientProfile error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new MedicalReportRepository();
