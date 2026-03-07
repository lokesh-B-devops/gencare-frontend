const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class MedicationEducationRepository extends BaseRepository {
    constructor() {
        super('medicationEducation', prisma);
    }

    async findByNameAndStage(name, stage) {
        try {
            return await this.prisma.medicationEducation.findFirst({
                where: {
                    name,
                    stage
                }
            });
        } catch (err) {
            console.error(`PostgreSQL findByNameAndStage error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new MedicationEducationRepository();
