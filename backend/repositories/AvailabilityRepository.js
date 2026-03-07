const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class AvailabilityRepository extends BaseRepository {
    constructor() {
        super('availability', prisma);
    }

    async findByDoctor(doctorId) {
        try {
            return await this.prisma.availability.findMany({
                where: { doctorId }
            });
        } catch (err) {
            console.error(`PostgreSQL findByDoctor error: ${err.message}`);
            throw err;
        }
    }

    async checkOverlap(doctorId, date, startTime, endTime) {
        try {
            return await this.prisma.availability.findFirst({
                where: {
                    doctorId,
                    date: new Date(date),
                    OR: [
                        { startTime: { lt: endTime, gte: startTime } },
                        { endTime: { gt: startTime, lte: endTime } }
                    ]
                }
            });
        } catch (err) {
            console.error(`PostgreSQL checkOverlap error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new AvailabilityRepository();
