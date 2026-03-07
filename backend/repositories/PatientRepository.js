const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class PatientRepository extends BaseRepository {
    constructor() {
        super('patientProfile', prisma);
    }

    async findByUserId(userId) {
        try {
            return await this.prisma.patientProfile.findUnique({
                where: { userId },
                include: { user: true }
            });
        } catch (err) {
            console.error(`PostgreSQL findByUserId error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new PatientRepository();
