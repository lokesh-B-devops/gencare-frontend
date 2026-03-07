const BaseRepository = require('./BaseRepository');
const prisma = require('../prisma/client');

class DoctorRepository extends BaseRepository {
    constructor() {
        super('doctorProfile', prisma);
    }

    async findByUserId(userId) {
        try {
            return await this.prisma.doctorProfile.findUnique({
                where: { userId },
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            });
        } catch (err) {
            console.error(`PostgreSQL findByUserId error in DoctorRepository: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new DoctorRepository();
