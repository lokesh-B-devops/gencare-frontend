const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class AppointmentRepository extends BaseRepository {
    constructor() {
        super('appointment', prisma);
    }

    async findUpcoming(userId, role) {
        const filter = role === 'doctor' ? { doctorId: userId } : { patientId: userId };

        try {
            return await this.prisma.appointment.findMany({
                where: {
                    ...filter,
                    date: { gte: new Date() }
                },
                orderBy: { date: 'asc' }
            });
        } catch (err) {
            console.error(`PostgreSQL findUpcoming error: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new AppointmentRepository();
