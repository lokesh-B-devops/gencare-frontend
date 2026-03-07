const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class PaymentRepository extends BaseRepository {
    constructor() {
        super('payment', prisma);
    }

    async findByPatientProfile(patientProfileId) {
        try {
            return await this.prisma.payment.findMany({
                where: { patientProfileId },
                orderBy: { createdAt: 'desc' }
            });
        } catch (err) {
            console.error(`PostgreSQL findByPatientProfile error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new PaymentRepository();
